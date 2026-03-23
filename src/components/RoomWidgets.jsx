import {
  Card, CardHeader, CardBody, Button, Divider, Input, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem
} from "@heroui/react";
import { AnimatedDiceOverlay } from "./AnimatedDice";

export function DeathSaveModal({
  isOpen,
  onClose,
  deathSaveResult,
  setDeathSaveResult,
  onSkip,
  onSend
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="font-cinzel text-red-800">Death Saving Throw</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-700">You are at 0 HP and it is your turn! Please roll a Death Saving Throw in real life and input the result.</p>
          <Input 
            type="number"
            label="Result (1-20)"
            value={deathSaveResult}
            onValueChange={setDeathSaveResult}
            min={1}
            max={20}
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onSkip}>Skip</Button>
          <Button color="primary" onPress={onSend}>Send to DM</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function TradeModal({
  isOpen,
  onClose,
  tradeTarget,
  playerCharacters,
  tradeMoney,
  setTradeMoney,
  character,
  tradeSearch,
  setTradeSearch,
  filteredTradeItems,
  tradeItems,
  setTradeItems,
  onGive
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="font-cinzel text-primary-800">
              Trade with {tradeTarget ? (playerCharacters[tradeTarget.email]?.charName || tradeTarget.email.split('@')[0]) : ""}
            </ModalHeader>
            <ModalBody>
              <h4 className="font-bold text-sm mb-2">Money</h4>
              <div className="flex gap-2 mb-4 flex-wrap">
                {["cp", "sp", "ep", "gp", "pp"].map(c => (
                  <Input 
                    key={c}
                    size="sm"
                    type="number"
                    label={c.toUpperCase()}
                    labelPlacement="outside"
                    placeholder={`Max: ${character[c] || 0}`}
                    value={tradeMoney[c]}
                    onValueChange={v => setTradeMoney(p => ({...p, [c]: v}))}
                    max={character[c] || 0}
                    min={0}
                    className="w-[90px]"
                  />
                ))}
              </div>
              <Divider />
              <h4 className="font-bold text-sm mt-4 mb-2">Items</h4>
              <Input 
                size="sm"
                placeholder="Search items..."
                value={tradeSearch}
                onValueChange={setTradeSearch}
                className="mb-2"
              />
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                {filteredTradeItems.length === 0 && <span className="text-sm italic text-default-400">No items found.</span>}
                {filteredTradeItems.map(({ item, idx }) => (
                  <div key={idx} className="flex justify-between items-center bg-default-50 p-2 rounded border border-default-200">
                    <span className="text-sm truncate mr-2" title={item.name}>{item.name} (x{item.qty || 1})</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-default-500">Give:</span>
                      <Input 
                        size="sm"
                        type="number"
                        value={tradeItems[idx] || ""}
                        onValueChange={v => setTradeItems(p => ({...p, [idx]: v}))}
                        placeholder="0"
                        min={0}
                        max={item.qty || 1}
                        className="w-16"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Cancel</Button>
              <Button color="primary" onPress={onGive}>Send</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function ChatAndDicePanel({
  messages,
  messagesEndRef,
  activeRolls,
  finalizeRoll,
  isDiceExpanded,
  setIsDiceExpanded,
  diceCount,
  setDiceCount,
  advDis,
  setAdvDis,
  diceMod,
  setDiceMod,
  handleRollDice,
  isRolling,
  setMessages,
  chatInput,
  setChatInput,
  handleSendMessage
}) {
  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm flex flex-col h-[600px]" style={{ border: "1px solid var(--gold)" }}>
      <CardHeader className="font-cinzel font-bold text-lg">Table / Chat</CardHeader>
      <Divider style={{ backgroundColor: "var(--gold-light)" }} />
      <CardBody className="flex flex-col flex-1 p-0 overflow-hidden relative">
        <div className="flex-1 p-4 overflow-y-auto" style={{ background: "rgba(255,255,255,0.5)" }}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-default-400 italic">Welcome to the room! Waiting for activity...</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="mb-2 text-sm">
                {msg.type === "system" && <span className="italic text-default-500">{msg.text}</span>}
                {msg.type === "chat" && (
                  <span className="whitespace-pre-wrap block">
                    <strong className={msg.sender === "You" ? "text-primary" : msg.sender === "DM" ? "text-purple-700" : "text-danger-700"}>{msg.sender}:</strong> {msg.text}
                  </span>
                )}
                {msg.type === "roll" && (
                  <span className={`p-2 rounded border block mt-1 shadow-sm ${msg.isNat20 ? 'bg-warning-100 border-warning-400' : msg.isNat1 ? 'bg-danger-100 border-danger-400' : 'bg-default-100 border-default-200'}`}>
                    <strong className={msg.sender === "You" ? "text-primary" : msg.sender === "DM" ? "text-purple-700" : "text-danger-700"}>{msg.sender}</strong> rolled a <strong>{msg.dice}</strong> and got: <strong className={`text-xl ml-1 ${msg.isNat20 ? 'text-warning-600' : msg.isNat1 ? 'text-danger-600' : 'text-red-700'}`}>{msg.result}</strong>
                    {msg.isNat20 && <span className="ml-2 font-cinzel font-bold text-warning-600 uppercase tracking-wider animate-pulse">Nat 20!</span>}
                    {msg.isNat1 && <span className="ml-2 font-cinzel font-bold text-danger-600 uppercase tracking-wider">Nat 1!</span>}
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <AnimatedDiceOverlay activeRolls={activeRolls} onComplete={finalizeRoll} />
        <div className="flex flex-col border-t border-yellow-600/30">
          <div className="flex justify-between items-center p-2 bg-default-100 border-b border-default-200 cursor-pointer select-none" onClick={() => setIsDiceExpanded(!isDiceExpanded)}>
            <span className="font-cinzel font-bold text-sm text-default-700">Dice Roller</span>
            <span className="text-default-500 text-sm">{isDiceExpanded ? "▼" : "▶"}</span>
          </div>
          {isDiceExpanded && (
            <div className="p-2 bg-default-50 flex flex-col gap-2 border-b border-default-200">
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-1">
                  <Button size="sm" isIconOnly variant="flat" onPress={() => setDiceCount(Math.max(1, (parseInt(diceCount) || 1) - 1).toString())}>-</Button>
                  <Input size="sm" type="number" placeholder="Qty" aria-label="Dice Count" className="w-16" value={diceCount} onValueChange={setDiceCount} min={1} />
                  <Button size="sm" isIconOnly variant="flat" onPress={() => setDiceCount(((parseInt(diceCount) || 1) + 1).toString())}>+</Button>
                </div>
                <Select size="sm" placeholder="Adv/Dis" aria-label="Advantage or Disadvantage" className="w-28" selectedKeys={[advDis]} onSelectionChange={(k) => setAdvDis(Array.from(k)[0])}>
                  <SelectItem key="normal" value="normal">Normal</SelectItem>
                  <SelectItem key="adv" value="adv">Advantage</SelectItem>
                  <SelectItem key="dis" value="dis">Disadvantage</SelectItem>
                </Select>
                <div className="flex items-center gap-1">
                  <Button size="sm" isIconOnly variant="flat" onPress={() => setDiceMod(((parseInt(diceMod) || 0) - 1).toString())}>-</Button>
                  <Input size="sm" type="number" placeholder="Mod" aria-label="Modifier" className="w-16" value={diceMod} onValueChange={setDiceMod} />
                  <Button size="sm" isIconOnly variant="flat" onPress={() => setDiceMod(((parseInt(diceMod) || 0) + 1).toString())}>+</Button>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {[4, 6, 8, 10, 12, 20].map((sides) => (
                    <Button key={sides} size="sm" variant="faded" color="danger" isIconOnly className="font-bold font-cinzel" onPress={() => handleRollDice(sides)} isDisabled={isRolling}>d{sides}</Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="flat" onPress={() => setMessages((prev) => prev.filter((m) => m.type !== "roll"))} isDisabled={isRolling}>Clear Rolls</Button>
                </div>
              </div>
            </div>
          )}
          <div className="p-3 bg-white flex gap-2 items-center">
            <Input placeholder="Send a message to the table..." size="sm" value={chatInput} onValueChange={setChatInput} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} className="flex-1" />
            <Button size="sm" color="primary" onPress={handleSendMessage}>Send</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function PlayerListPanel({
  displayUsers,
  playerCharacters,
  user,
  isDM,
  setTradeTarget,
  setTradeMoney,
  setTradeItems,
  setTradeSearch,
  isPlayersExpanded,
  setIsPlayersExpanded
}) {
  return (
    <Card className="shadow-sm shrink-0 h-auto" style={{ border: "1px solid var(--gold)" }}>
      <CardHeader className="font-cinzel font-bold text-lg cursor-pointer flex justify-between items-center p-4" onClick={() => setIsPlayersExpanded(!isPlayersExpanded)}>
        <span>Players in Room ({displayUsers.length})</span>
        <span className="text-sm text-default-500">{isPlayersExpanded ? "▼" : "▶"}</span>
      </CardHeader>
      {isPlayersExpanded && (
        <>
          <Divider style={{ backgroundColor: "var(--gold-light)" }} />
          <CardBody className="gap-3 py-4">
            {displayUsers.map((cu, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-default-50 border border-default-200">
                <span className="text-base font-semibold text-default-800">
                  {playerCharacters[cu.email]?.charName ? `${playerCharacters[cu.email].charName} (${cu.email.split("@")[0]})` : (cu.email ? cu.email.split("@")[0] : "Unknown")}{" "}
                  {cu.email === user.email && <span className="text-xs text-default-400 font-normal">(You)</span>}
                </span>
                <div className="flex items-center gap-2">
                  {cu.email !== user.email && cu.role !== "DM" && !isDM && (
                    <Button size="sm" variant="flat" color="primary" onPress={() => { setTradeTarget(cu); setTradeMoney({ cp: '', sp: '', ep: '', gp: '', pp: '' }); setTradeItems({}); setTradeSearch(""); }}>Trade</Button>
                  )}
                  <Chip size="md" color={cu.role === "DM" ? "secondary" : "primary"} variant="flat" className="font-bold">{cu.role || "Player"}</Chip>
                </div>
              </div>
            ))}
          </CardBody>
        </>
      )}
    </Card>
  );
}

export function InitiativePanel({
  initiativeList,
  roundCount,
  isDM,
  initName,
  myName,
  setInitName,
  initVal,
  setInitVal,
  handleAddInitiative,
  activeVal,
  handleNextTurn,
  handlePrevTurn,
  handleRemoveInitiative,
  syncInitiative,
  isInitiativeExpanded,
  setIsInitiativeExpanded
}) {
  return (
    <Card className="shadow-sm shrink-0 h-auto" style={{ border: "1px solid var(--gold)", minHeight: isInitiativeExpanded ? "300px" : "auto" }}>
      <CardHeader className="font-cinzel font-bold text-lg flex flex-row justify-between items-center py-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setIsInitiativeExpanded(!isInitiativeExpanded)}>
          <span>Initiative</span>
          {initiativeList.length > 0 && <Chip size="sm" variant="flat" color="danger" className="ml-1 font-bold">Round {roundCount}</Chip>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {isDM && (
            <div className="flex gap-1 flex-wrap justify-end">
              <Button size="sm" variant="flat" onPress={handlePrevTurn}>Prev</Button>
              <Button size="sm" variant="flat" onPress={handleNextTurn}>Next</Button>
              <Button size="sm" variant="light" color="danger" onPress={() => syncInitiative([], 0, 1)}>Clear</Button>
            </div>
          )}
          <span className="text-sm text-default-500 cursor-pointer ml-1 md:ml-2" onClick={() => setIsInitiativeExpanded(!isInitiativeExpanded)}>{isInitiativeExpanded ? "▼" : "▶"}</span>
        </div>
      </CardHeader>
      {isInitiativeExpanded && (
        <>
          <Divider style={{ backgroundColor: "var(--gold-light)" }} />
          <CardBody className="gap-3 flex flex-col overflow-hidden">
            <div className="flex gap-2 mb-2 shrink-0 flex-wrap">
              <Input size="sm" placeholder="Name" value={isDM ? initName : myName} onValueChange={setInitName} isDisabled={!isDM} className="flex-1 min-w-[120px]" />
              <Input size="sm" type="number" placeholder="Init" className="w-20" value={initVal} onValueChange={setInitVal} onKeyDown={(e) => e.key === "Enter" && handleAddInitiative()} />
              <Button size="sm" color="primary" onPress={handleAddInitiative}>Add</Button>
            </div>
            <div className="flex flex-col gap-2">
              {initiativeList.map((item) => {
                const isCurrentTurn = activeVal !== null && item.val === activeVal;
                return (
                  <div key={item.id} className={`flex justify-between items-center p-2 rounded border ${isCurrentTurn ? "bg-danger-50 border-danger-300 shadow-sm" : "bg-default-50 border-default-200"}`}>
                    <span className={`font-bold text-sm ${isCurrentTurn ? "text-danger-700" : "text-default-700"}`}>{isCurrentTurn && "▶ "}{item.name}</span>
                    <div className="flex items-center gap-3">
                      {isCurrentTurn && item.name === myName && <Button size="sm" color="success" variant="flat" onPress={handleNextTurn} className="h-6 min-h-6 px-2 text-xs font-bold">End Turn</Button>}
                      <Chip size="sm" color={isCurrentTurn ? "danger" : "default"} variant="flat">{item.val}</Chip>
                      {(isDM || item.name === myName) && <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleRemoveInitiative(item.id)} className="h-6 min-h-6 w-6 min-w-6 text-lg">×</Button>}
                    </div>
                  </div>
                );
              })}
              {initiativeList.length === 0 && <span className="text-sm text-default-400 italic text-center py-4">No combatants added yet.</span>}
            </div>
          </CardBody>
        </>
      )}
    </Card>
  );
}

export function SharedLootPanel({ sharedPiles, isDM, handleGrabItem, toggleItemExpanded, expandedItems, isLootExpanded, setIsLootExpanded }) {
  if (sharedPiles.length === 0) return null;
  return (
    <Card className="shadow-sm shrink-0 h-auto" style={{ border: "1px solid var(--gold)" }}>
      <CardHeader className="font-cinzel font-bold text-lg cursor-pointer flex justify-between items-center" style={{ borderBottom: isLootExpanded ? "1px solid var(--gold-light)" : "none" }} onClick={() => setIsLootExpanded(!isLootExpanded)}>
        <span>Shared Loot</span>
        <span className="text-sm text-default-500">{isLootExpanded ? "▼" : "▶"}</span>
      </CardHeader>
      {isLootExpanded && (
        <CardBody className="gap-3">
          {sharedPiles.map((pile) => (
            <div key={pile.id} className="bg-default-50 border border-default-200 rounded p-2">
              <h4 className="font-bold text-sm text-danger-800 mb-1" style={{ borderBottom: "1px solid var(--gold-light)", paddingBottom: "4px" }}>{pile.name}</h4>
              <ul className="text-sm flex flex-col gap-1">
                {pile.items.map((item) => (
                  <li key={item.id} className="flex flex-col">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleItemExpanded(item.id)}>
                      <span><strong>{item.qty}x</strong> {item.name}</span>
                      <div className="flex items-center gap-2">
                        {item.desc && <span className="text-xs text-primary">{expandedItems.has(item.id) ? "Hide" : "Details"}</span>}
                        {!isDM && item.qty > 0 && <Button size="sm" variant="flat" color="success" className="h-6 min-h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleGrabItem(pile, item); }}>Grab</Button>}
                      </div>
                    </div>
                    {expandedItems.has(item.id) && item.desc && (
                      <div className="mt-1 text-xs text-default-600 bg-white p-2 rounded border border-default-100">
                        {item.desc.includes("<") ? <div dangerouslySetInnerHTML={{ __html: item.desc }} /> : <span className="whitespace-pre-wrap">{item.desc}</span>}
                      </div>
                    )}
                  </li>
                ))}
                {pile.items.length === 0 && <li className="text-xs italic text-default-400">Empty pile</li>}
              </ul>
            </div>
          ))}
        </CardBody> 
      )}
    </Card>
  );
}

export function SharedShopPanel({ sharedShops, isDM, handleBuyItem, parsePrice, toggleItemExpanded, expandedItems, isShopExpanded, setIsShopExpanded }) {
  if (sharedShops.length === 0) return null;
  return (
    <Card className="shadow-sm shrink-0 h-auto" style={{ border: "1px solid var(--gold)" }}>
      <CardHeader className="font-cinzel font-bold text-lg cursor-pointer flex justify-between items-center" style={{ borderBottom: isShopExpanded ? "1px solid var(--gold-light)" : "none" }} onClick={() => setIsShopExpanded(!isShopExpanded)}>
        <span>Shops & Merchants</span>
        <span className="text-sm text-default-500">{isShopExpanded ? "▼" : "▶"}</span>
      </CardHeader>
      {isShopExpanded && (
        <CardBody className="gap-3">
          {sharedShops.map((shop) => (
            <div key={shop.id} className="bg-default-50 border border-default-200 rounded p-2">
              <h4 className="font-bold text-sm text-danger-800 mb-1" style={{ borderBottom: "1px solid var(--gold-light)", paddingBottom: "4px" }}>{shop.name}</h4>
              <ul className="text-sm flex flex-col gap-1">
                {shop.items.map((item) => (
                  <li key={item.id} className="flex flex-col">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleItemExpanded(item.id)}>
                      <span><strong>{item.qty}x</strong> {item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-success-700">{item.price}</span>
                        {item.desc && <span className="text-xs text-primary">{expandedItems.has(item.id) ? "Hide" : "Details"}</span>}
                        {!isDM && item.qty > 0 && parsePrice(item.price) && <Button size="sm" variant="solid" color="primary" className="h-6 min-h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); handleBuyItem(shop, item); }}>Buy</Button>}
                      </div>
                    </div>
                    {expandedItems.has(item.id) && item.desc && (
                      <div className="mt-1 text-xs text-default-600 bg-white p-2 rounded border border-default-100">
                        {item.desc.includes("<") ? <div dangerouslySetInnerHTML={{ __html: item.desc }} /> : <span className="whitespace-pre-wrap">{item.desc}</span>}
                      </div>
                    )}
                  </li>
                ))}
                {shop.items.length === 0 && <li className="text-xs italic text-default-400">Empty shop</li>}
              </ul>
            </div>
          ))}
        </CardBody>
      )}
    </Card>
  );
}

export function DMCharactersTab({ playerCharacters }) {
  return (
    <div className="pt-4 h-full pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(playerCharacters).length === 0 && <div className="italic text-default-500">No characters synced yet.</div>}
        {Object.entries(playerCharacters).map(([email, char]) => (
          <Card key={email} shadow="sm" style={{ border: "1px solid var(--gold)" }}>
            <CardHeader className="font-cinzel font-bold text-lg flex justify-between bg-default-100">
              <span>{char.charName || "Unnamed"}</span>
              <span className="text-sm font-normal text-default-500">{email}</span>
            </CardHeader>
            <CardBody className="text-sm gap-2">
              <div className="flex justify-between font-bold">
                <span>{char.race} {char.charClass} (Lv {char.level || 1})</span>
                <span className="text-red-700">HP: {char.hp}/{char.maxHp} {char.tempHp ? `(+${char.tempHp})` : ''}</span>
              </div>
              <div className="grid grid-cols-6 gap-1 text-center mt-2">
                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                  const score = parseInt(char[stat]) || 10;
                  const mod = Math.floor((score - 10) / 2);
                  const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                  return (
                    <div key={stat} className="flex flex-col bg-default-50 p-1 rounded border border-default-200">
                      <span className="text-xs uppercase text-default-500">{stat}</span>
                      <span className="font-bold text-sm">{score} <span className="text-xs text-default-400 font-normal">({modStr})</span></span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-default-600 bg-default-50 p-2 rounded border border-default-200">
                <span>AC: {char.baseAC || 10}</span>
                <span>Speed: {char.speed || 30} ft</span>
              </div>
              {char.activeConditions && char.activeConditions.length > 0 && (
                <div className="flex flex-col mt-2 text-xs text-danger-800 bg-danger-50 p-2 rounded border border-danger-200 gap-1">
                  <div><strong>Conditions:</strong> {Array.isArray(char.activeConditions) ? char.activeConditions.join(", ") : char.activeConditions}</div>
                </div>
              )}
              {(char.resistances || char.immunities || char.vulnerabilities) && (
                <div className="flex flex-col mt-2 text-xs text-default-600 bg-default-50 p-2 rounded border border-default-200 gap-1">
                  {char.resistances && <div><strong className="text-danger-700">Resistances:</strong> {char.resistances}</div>}
                  {char.immunities && <div><strong className="text-danger-700">Immunities:</strong> {char.immunities}</div>}
                  {char.vulnerabilities && <div><strong className="text-danger-700">Vulnerabilities:</strong> {char.vulnerabilities}</div>}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AuditLogTab({ messages }) {
  return (
    <div className="pt-4">
      <Card shadow="sm" style={{ border: "2px solid var(--gold)" }}>
        <CardHeader className="font-cinzel font-bold text-lg border-b border-yellow-600/30">
          Room Audit Log
        </CardHeader>
        <CardBody className="gap-0 p-0 max-h-[700px] overflow-y-auto bg-default-50">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex gap-4 text-sm border-b border-default-200 py-2 px-4 hover:bg-default-100">
              <span className="text-default-400 whitespace-nowrap" style={{ minWidth: 70 }}>{msg.timestamp || "-"}</span>
              <span className="font-bold" style={{ minWidth: 100 }}>{msg.sender || "System"}</span>
              <span className="flex-1">
                {msg.type === "roll" ? `Rolled ${msg.dice}: ${msg.result} ${msg.isNat20 ? '[NAT 20]' : msg.isNat1 ? '[NAT 1]' : ''}` : msg.text}
              </span>
            </div>
          ))}
          {messages.length === 0 && <div className="p-4 italic text-default-400">No events logged yet.</div>}
        </CardBody>
      </Card>
    </div>
  );
}