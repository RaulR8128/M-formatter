import React, { useState } from 'react';
import { 
  FileCode, Play, Copy, ChevronRight, ChevronLeft, 
  Settings2, Database, CheckCircle2, AlertCircle 
} from 'lucide-react';

import { analyzeMCode } from './analyzer';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle, analyzed, error
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  const [steps, setSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [config, setConfig] = useState({
    indentation: '4',
    commas: 'end',
    emptyLines: false,
    naming: 'original',
  });

  const handleAnalyze = () => {
    const result = analyzeMCode(inputCode);
    if (result.success) {
      setStatus('analyzed');
      setSteps(result.steps);
      setErrorMessage('');
    } else {
      setStatus('error');
      setSteps([]);
      setErrorMessage(result.error);
    }
  };

  const handleApply = () => {
    if (status !== 'analyzed') return;
    let formatted = inputCode.trim();
    if (config.emptyLines) {
      formatted = formatted.replace(/,/g, ',\n\n');
    }
    const header = `// Formateado por M-Formatter\n// Estilo: ${config.naming}\n\n`;
    setOutputCode(header + formatted);
  };

  const handleCopy = () => {
    if (!outputCode) return;
    const el = document.createElement('textarea');
    el.value = outputCode;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F3F2F1] text-[#323130] font-sans overflow-hidden">
      
      {/* RIBBON SUPERIOR */}
      <div className="bg-white border-b border-gray-300 flex items-center justify-between p-2 shadow-sm shrink-0 z-10">
        <div className="flex items-center space-x-6 divide-x divide-gray-200">
          <div className="px-4 flex flex-col items-center">
            <button 
              onClick={() => { setInputCode(''); setStatus('idle'); setSteps([]); setOutputCode(''); }}
              className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded text-gray-700 transition-colors"
            >
              <FileCode size={24} className="text-[#F2C811] mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Limpiar</span>
            </button>
          </div>

          <div className="px-4 flex gap-4 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Sangría</label>
              <select 
                disabled={status !== 'analyzed'}
                className="text-xs border border-gray-300 rounded p-1 bg-gray-50 outline-none focus:border-[#F2C811]"
                value={config.indentation}
                onChange={(e) => setConfig({...config, indentation: e.target.value})}
              >
                <option value="2">2 espacios</option>
                <option value="4">4 espacios</option>
                <option value="tab">Tabulaciones</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Comas</label>
              <select 
                disabled={status !== 'analyzed'}
                className="text-xs border border-gray-300 rounded p-1 bg-gray-50 outline-none focus:border-[#F2C811]"
                value={config.commas}
                onChange={(e) => setConfig({...config, commas: e.target.value})}
              >
                <option value="end">Al final</option>
                <option value="start">Al inicio</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="emptyLines" 
                disabled={status !== 'analyzed'}
                checked={config.emptyLines}
                onChange={(e) => setConfig({...config, emptyLines: e.target.checked})}
                className="accent-[#F2C811] cursor-pointer"
              />
              <label htmlFor="emptyLines" className={`text-[11px] font-bold uppercase tracking-tighter cursor-pointer ${status !== 'analyzed' ? 'text-gray-300' : 'text-gray-600'}`}>
                Espacios extra
              </label>
            </div>
          </div>

          <div className="px-4 flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Nombres</label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              {['original', 'camel', 'snake'].map(style => (
                <button 
                  key={style}
                  disabled={status !== 'analyzed'}
                  className={`px-3 py-1 text-[10px] border-r last:border-0 font-bold uppercase tracking-tighter
                    ${config.naming === style ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'} 
                    disabled:opacity-30`}
                  onClick={() => setConfig({...config, naming: style})}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4">
          <button 
            onClick={handleApply}
            disabled={status !== 'analyzed'}
            className={`flex items-center gap-2 px-8 py-2.5 rounded font-black text-xs tracking-widest transition-all transform active:scale-95
              ${status === 'analyzed' 
                ? 'bg-[#F2C811] hover:bg-black hover:text-white text-black shadow-lg shadow-[#F2C811]/20' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Settings2 size={16} />
            APLICAR FORMATO
          </button>
        </div>
      </div>

      {/* CUERPO CENTRAL */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* PANEL IZQUIERDO */}
        <div className="flex flex-col w-1/2 border-r border-gray-700 bg-[#252423]">
          <div className="bg-[#1e1d1c] px-4 py-2 border-b border-gray-800">
            <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase italic">Input // Script M</span>
          </div>
          <textarea 
            className="flex-1 w-full bg-[#252423] text-[#D4D4D4] font-mono p-6 resize-none outline-none focus:bg-[#2a2928] leading-relaxed selection:bg-[#F2C811] selection:text-black"
            placeholder="let&#10;    Origen = Excel.Workbook(File.Contents(...)),&#10;    Filtrado = Table.SelectRows(Origen, each ... )&#10;in&#10;    Filtrado"
            value={inputCode}
            onChange={(e) => { setInputCode(e.target.value); if (status !== 'idle') setStatus('idle'); }}
            spellCheck="false"
          />
          <div className="bg-[#1e1d1c] p-4 flex justify-center border-t border-gray-800">
            <button 
              onClick={handleAnalyze}
              className={`flex items-center gap-3 px-12 py-3 rounded-full font-black text-xs tracking-widest transition-all
                ${inputCode.trim() ? 'bg-white hover:bg-[#F2C811] text-black shadow-xl scale-105 active:scale-95' : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'}`}
            >
              <Play size={16} fill="currentColor" />
              ANALIZAR CÓDIGO
            </button>
          </div>
        </div>

        {/* PANEL CENTRAL */}
        <div className={`flex flex-col transition-all duration-500 ${isStepsOpen ? 'w-[30%]' : 'w-1/2'} bg-[#2b2a29]`}>
          <div className="flex justify-between items-center bg-[#1e1d1c] px-4 py-2 border-b border-gray-800">
            <span className="text-[10px] font-black text-[#F2C811] tracking-widest uppercase">Output // Vista Previa</span>
            <button onClick={handleCopy} disabled={!outputCode} className="text-[10px] font-black uppercase text-gray-500 hover:text-white disabled:opacity-0">
              <Copy size={12} className="inline mr-1" /> Copiar
            </button>
          </div>
          <textarea readOnly className="flex-1 w-full bg-[#1e1d1c] text-gray-400 font-mono p-6 resize-none outline-none italic" value={outputCode} placeholder="// Resultados aquí..." spellCheck="false" />
        </div>

        {/* PANEL DERECHO (PASOS) */}
        <div className={`bg-white border-l border-gray-300 flex flex-col transition-all duration-500 ${isStepsOpen ? 'w-[20%]' : 'w-0 overflow-hidden'}`}>
          <div className="flex justify-between items-center bg-gray-100 px-4 py-3 border-b border-gray-200 shrink-0">
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Pasos del Query</span>
            <button onClick={() => setIsStepsOpen(false)} className="text-gray-400 hover:text-black"><ChevronRight size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F9F9]">
            {status !== 'analyzed' ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-[10px] text-center px-6">
                <Database size={32} className="opacity-10 mb-4" />
                <p className="font-bold uppercase tracking-widest leading-loose">Analiza el código para extraer la estructura</p>
              </div>
            ) : (
              <div className="space-y-1">
                {steps.map((step, idx) => (
                  <div key={idx} className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#F2C811] transition-all cursor-default">
                    <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-400 group-hover:bg-[#F2C811] group-hover:text-black">{idx + 1}</div>
                    <span className="text-[11px] font-bold text-gray-600 truncate flex-1 tracking-tight">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isStepsOpen && (
          <button onClick={() => setIsStepsOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 border border-r-0 border-gray-300 rounded-l-xl hover:bg-[#F2C811] shadow-2xl transition-all"><ChevronLeft size={18} /></button>
        )}
      </div>

      {/* ESTADO INFERIOR */}
      <div className={`border-t px-5 py-2 flex justify-between items-center shrink-0 transition-all duration-500 ${status === 'error' ? 'bg-red-600 text-white' : 'bg-[#EDEBE9] border-gray-300 text-gray-600'}`}>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          {status === 'idle' && <span>Sistema listo</span>}
          {status === 'analyzed' && <div className="flex items-center gap-2 text-green-700"><CheckCircle2 size={14} /> <span>VÁLIDO // {steps.length} PASOS</span></div>}
          {status === 'error' && <div className="flex items-center gap-2"><AlertCircle size={14} /> <span>ERROR: {errorMessage}</span></div>}
        </div>
        <span className="text-[9px] font-black tracking-tighter bg-white/50 px-3 py-1 rounded border border-black/5 shadow-inner uppercase tracking-widest">M-Formatter V1.2.2</span>
      </div>
    </div>
  );
}