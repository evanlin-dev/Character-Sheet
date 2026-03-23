import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Divider } from "@heroui/react";
import { Link } from 'react-router-dom';

const STEPS = [
  {
    title: "1. Have Your Link Ready",
    content: "First, have the data link ready that was given to you by your DM or group organizer."
  },
  {
    title: "2. Open the Sidebar Menu",
    content: "On the main Character Sheet, click the button with the 3 horizontal lines in the top-left corner to open the sidebar.",
    visual: (
      <div className="relative border-2 border-[#d4a574] bg-[#f4e8d8] p-4 h-32 rounded-lg flex items-start mt-6 shadow-inner overflow-hidden pointer-events-none">
        <button className="absolute top-4 left-4 w-10 h-10 bg-[#8b2e2e] text-white border-2 border-[#d4a574] rounded-full text-xl flex items-center justify-center shadow-md">☰</button>
        <div className="mx-auto text-center border-b-2 border-[#d4a574] w-3/4 pb-2 mt-2 relative">
          <h1 className="font-cinzel text-xl font-bold text-[#6b1e1e]">Character Sheet</h1>
          <div className="text-xs text-[#5a4838] font-serif italic mt-1">Character</div>
        </div>
      </div>
    )
  },
  {
    title: "3. Go to Data Browser",
    content: "In the sidebar menu that opens, click on the 'Data Browser' button.",
    visual: (
       <div className="w-48 bg-[#e8dcc5] border-2 border-[#d4a574] p-3 rounded mx-auto mt-6 shadow-md flex flex-col gap-2 pointer-events-none">
         <div className="bg-white border border-[#d4a574] p-2 text-sm font-cinzel font-bold text-center rounded opacity-60">Character Creator</div>
         <div className="bg-[#f4e8d8] border border-[#8b2e2e] text-[#6b1e1e] p-2 text-sm font-cinzel font-bold text-center rounded shadow-sm scale-105">Data Browser</div>
         <div className="bg-white border border-[#d4a574] p-2 text-sm font-cinzel font-bold text-center rounded opacity-60">Compendium</div>
       </div>
    )
  },
  {
    title: "4. Paste and Fetch",
    content: "In the Data Browser, paste the link you copied earlier into the text box and click the 'Fetch URL' button.",
    visual: (
      <div className="mt-6 flex flex-col items-center gap-3 p-4 bg-white border-2 border-[#d4a574] rounded shadow-sm pointer-events-none">
         <input type="text" readOnly value="https://example.com/my-group-data.zip" className="w-full p-2 border border-[#d4a574] rounded font-mono text-xs bg-gray-50 text-gray-500" />
         <button className="bg-gradient-to-br from-[#8b2e2e] to-[#6b1e1e] text-white font-cinzel font-bold px-6 py-2 rounded shadow-md text-sm">Fetch URL</button>
      </div>
    )
  },
  {
    title: "5. Success!",
    content: "Wait for the files to process. Once they appear in the list at the bottom of the page, your data is loaded! You can return to your Character Sheet."
  }
];

export default function DataTutorialPage() {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = STEPS[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--parchment)" }}>
      <div className="absolute top-4 left-4">
        <Button as={Link} to="/" variant="flat" className="font-cinzel font-bold">← Back to Home</Button>
      </div>

      <Card className="max-w-xl w-full shadow-lg" style={{ border: "2px solid var(--gold)" }}>
        <CardHeader className="flex flex-col items-center gap-2 pt-6 pb-2 bg-default-50">
          <h1 className="font-cinzel text-2xl font-bold text-red-800 text-center">How to Upload Data</h1>
          <p className="text-default-500 text-sm text-center">Follow this step-by-step guide to import content into your app.</p>
        </CardHeader>
        <Divider style={{ backgroundColor: "var(--gold-light)" }} />
        <CardBody className="p-6 min-h-[200px] flex flex-col justify-center bg-white">
          <h2 className="text-xl font-bold mb-4 font-cinzel text-default-800">{current.title}</h2>
          <p className="text-md text-default-700 leading-relaxed font-serif">{current.content}</p>
          {current.visual}
        </CardBody>
        <Divider style={{ backgroundColor: "var(--gold-light)" }} />
        <div className="p-4 flex justify-between items-center bg-default-50 rounded-b-xl">
          <Button variant="flat" onPress={prevStep} isDisabled={step === 0} className="font-bold">
            ← Back
          </Button>
          
          <div className="flex-1 mx-6 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-default-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-800 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
            <span className="text-xs font-cinzel font-bold text-default-500 whitespace-nowrap">{step + 1} / {STEPS.length}</span>
          </div>

          {step < STEPS.length - 1 ? (
            <Button color="primary" onPress={nextStep} className="font-bold">Next →</Button>
          ) : (
            <Button as={Link} to="/data" style={{ background: "var(--red-dark)", color: "white" }} className="font-bold">Go to Data Viewer</Button>
          )}
        </div>
      </Card>
    </div>
  );
}