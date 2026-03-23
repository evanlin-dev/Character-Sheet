import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody, Button, Input, Divider } from "@heroui/react";
import { createClient } from "@supabase/supabase-js";

// Toggle this to true to test UI without needing to log in or use Supabase
const BYPASS_AUTH = false;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (BYPASS_AUTH) {
      let bypassUser = sessionStorage.getItem('bypassUser');
      if (!bypassUser) {
        bypassUser = `tester_${Math.floor(Math.random() * 1000)}@example.com`;
        sessionStorage.setItem('bypassUser', bypassUser);
      }
      let userRole = sessionStorage.getItem('userRole') || 'Player';
      setUser({ email: bypassUser, role: userRole });
      setRooms([
        { id: "mock-1", name: "Mock Campaign: Curse of Strahd", createdBy: "dm@example.com" },
        { id: "mock-2", name: "Mock Campaign: Dragon Heist", createdBy: "other@example.com" }
      ]);
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        let userRole = sessionStorage.getItem('userRole') || 'Player';
        setUser({ email: session.user.email, role: userRole });
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        let userRole = sessionStorage.getItem('userRole') || 'Player';
        setUser({ email: session.user.email, role: userRole });
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (BYPASS_AUTH || !user) return;
    
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, created_by, created_at')
        .order('created_at', { ascending: false });
        
      if (data) {
        setRooms(data.map(r => ({ ...r, createdBy: r.created_by, createdAt: r.created_at })));
      }
      setLoading(false);
    };
    fetchRooms();

    // Real-time listener for available rooms
    const channel = supabase.channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    sessionStorage.setItem('userRole', newRole);
    setUser(prev => ({ ...prev, role: newRole }));
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    setCreating(true);

    if (BYPASS_AUTH) {
      setTimeout(() => {
        setRooms(prev => [{ id: Date.now().toString(), name: newRoomName.trim(), createdBy: user.email }, ...prev]);
        setNewRoomName("");
        setCreating(false);
      }, 500);
      return;
    }

    try {
      const { error } = await supabase.from('rooms').insert([{
        id: crypto.randomUUID(), // Guarantee a unique ID
        name: newRoomName.trim(),
        created_by: user.email
      }]);
      if (error) throw error;
      setNewRoomName("");
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Error creating room.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    if (BYPASS_AUTH) {
      navigate("/");
      return;
    }
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--parchment)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(42,24,16,0.02) 2px, rgba(42,24,16,0.02) 4px)', pointerEvents: 'none', opacity: 0.5 }} />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8 bg-white/70 p-4 rounded-lg shadow-sm border border-yellow-600/30">
          <h1 className="font-cinzel text-3xl font-bold text-red-800 m-0 border-none">Campaign Rooms</h1>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-default-600">{user.email.split('@')[0]}</span>
              <select 
                value={user.role} 
                onChange={handleRoleChange}
                className="text-xs bg-transparent border-none text-primary font-bold cursor-pointer outline-none"
              >
                <option value="Player">Role: Player</option>
                <option value="DM">Role: DM</option>
              </select>
            </div>
            <Button color="danger" variant="flat" size="sm" onPress={handleLogout}>Log Out</Button>
          </div>
        </div>

        <Card className="mb-8" style={{ border: '1px solid var(--gold)' }}>
          <CardBody className="flex flex-row items-center gap-4 p-4">
            <Input aria-label="New Room Name" placeholder="New Room Name (e.g. Curse of Strahd - Friday Group)" value={newRoomName} onValueChange={setNewRoomName} className="flex-1" isDisabled={creating} />
            <Button color="primary" onPress={handleCreateRoom} isLoading={creating} isDisabled={!newRoomName.trim()} className="font-cinzel font-bold h-10 px-6">
              Create Room
            </Button>
          </CardBody>
        </Card>

        <h2 className="font-cinzel text-xl font-bold text-red-800 mb-4 border-b border-yellow-600/30 pb-2">Active Rooms</h2>
        
        {loading ? (
          <div className="text-center italic text-default-500 mt-8">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center italic text-default-500 mt-8">No rooms available. Create one above!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map(room => (
              <Card key={room.id} shadow="sm" className="hover:shadow-md transition-shadow" style={{ border: '1px solid var(--gold-light)' }}>
                <CardHeader className="font-cinzel font-bold text-lg pb-0">{room.name}</CardHeader>
                <CardBody className="text-sm text-default-500 py-2">
                  Created by: {room.createdBy ? room.createdBy.split('@')[0] : 'Unknown'}
                </CardBody>
                <Divider style={{ backgroundColor: 'var(--gold-light)' }} />
                <div className="p-3 bg-default-50 flex justify-end">
                  <Button color="primary" variant="flat" size="sm" onPress={() => navigate(`/rooms/${room.id}`)}>Join Room</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}