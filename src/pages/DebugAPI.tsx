// src/pages/DebugAPI.tsx — SECRET API TESTER
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DebugAPI() {
  const [results, setResults] = useState<any[]>([]);

  const runTest = async (name: string, fn: () => Promise<any>) => {
    try {
      const data = await fn();
      setResults(prev => [...prev, { name, status: "PASS", data }]);
    } catch (err: any) {
      setResults(prev => [...prev, { name, status: "FAIL", error: err.message }]);
    }
  };

  const testAll = async () => {
    setResults([]);
    
    await runTest("Health Check", () => fetch("http://localhost:5000/health").then(r => r.json()));
    await runTest("Public Areas", () => fetch("http://localhost:5000/api/areas").then(r => r.json()));
    await runTest("Check Lahore", () => fetch("http://localhost:5000/api/areas/check?lat=31.5204&lng=74.3587").then(r => r.json()));
    await runTest("Check Karachi", () => fetch("http://localhost:5000/api/areas/check?lat=24.8607&lng=67.0011").then(r => r.json()));
    await runTest("Check Outside", () => fetch("http://localhost:5000/api/areas/check?lat=40&lng=70").then(r => r.json()));
  };

  useEffect(() => {
    testAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">API Health Check</h1>
        
        <Button onClick={testAll} className="mb-8 w-full max-w-xs mx-auto block">
          Run All Tests Again
        </Button>

        <div className="grid gap-4">
          {results.map((r, i) => (
            <Card key={i} className={`p-6 ${r.status === "PASS" ? "border-green-500" : "border-red-500"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{r.name}</h3>
                <span className={`px-4 py-2 rounded-full text-white font-bold ${r.status === "PASS" ? "bg-green-600" : "bg-red-600"}`}>
                  {r.status}
                </span>
              </div>
              <pre className="mt-4 text-sm bg-black/5 p-4 rounded overflow-x-auto">
                {JSON.stringify(r.status === "PASS" ? r.data : r.error, null, 2)}
              </pre>
            </Card>
          ))}
        </div>

        {results.length === 5 && results.every(r => r.status === "PASS") && (
          <div className="text-center mt-12">
            <h2 className="text-5xl font-bold text-green-600 mb-4">ALL APIs WORKING PERFECTLY!</h2>
            <p className="text-2xl">Your backend is 100% healthy</p>
          </div>
        )}
      </div>
    </div>
  );
}