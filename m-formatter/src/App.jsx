import React, { useState } from 'react';
import { 
  FileCode, Play, Copy, ChevronRight, ChevronLeft, 
  Settings2, Database, Filter, ArrowRightLeft, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState('idle'); 
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  
  const [config, setConfig] = useState({
    indentation: '4',
    commas: 'end',
    emptyLines: false,
    naming: 'original',
    lang: 'es'
  });

  const mockSteps = ['Origen', 'Tipo Cambiado', 'Filtrado', 'Agregado'];

  const handleAnalyze = () => {
    if (!inputCode.trim()) {
      setStatus('error');
      return;
    }
    setStatus('analyzed');
  };

  const handleApply = () => {
    if (status !== 'analyzed') return;
    setOutputCode(`// Código formateado aplicado con:\n// Sangría: ${config.indentation} espacios\n// Comas: ${config.commas}\n// Estilo nombres: ${config.naming}\n\n${inputCode}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    alert("¡Código copiado!");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F3F2F1] text-[#323130] font-sans overflow-hidden border-t-4 border-[#F2C811]">
      
      {/* RIBBON SUPERIOR */}
      <div className="bg-white border-b border-gray-300 flex items-center justify-between p-2 shadow-sm shrink-0 z-10">
        <div className="flex items-center space-x-6 divide-x divide-gray-200">
          <div className="px-4 flex flex-col items-center">
            <button className="flex flex-col items-center justify-center p-1 hover:bg-gray-100 rounded">
              <FileCode size={22} className="text-[#F2C811] mb-1" />
              <span className="text-[10px] font-bold uppercase">Nuevo</span>
            </button>
          </div>

          <div className="px-4 flex gap-6 items-center">
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sangría</label>
              <select 
                disabled={status !== 'analyzed'}
                className="text-xs border border-gray-300 rounded p-1 bg-white outline-none focus:ring-1 focus:ring-[#F2C811]"
                value={config.indentation}
                onChange={(e) => setConfig({...config, indentation: e.target.value})}
              >
                <option value="2">2 espacios</option>
                <option value="4">4 espacios</option>
                <option value="tab">Tabulaciones</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Comas</label>
              <select 
                disabled={status !== 'analyzed'}
                className="text-xs border border-gray-300 rounded p-1 bg-white outline-none focus:ring-1 focus:ring-[#F2C811]"
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
                className="accent-[#F2C811]"
                disabled={status !== 'analyzed'}
                checked={config.emptyLines}
                onChange={(e) => setConfig({...config, emptyLines: e.target.checked})}
              />
              <label htmlFor="emptyLines" className={`text-xs font-medium ${status !== 'analyzed' ? 'text-gray-300' : 'text-gray-600'}`}>Separar pasos</label>
            </div>
          </div>

          <div className="px-4 flex flex-col gap-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Nombres de Pasos</label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              {['original', 'camel', 'snake'].map(style => (
                <button 
                  key={style}
                  disabled={status !== 'analyzed'}
                  className={`px-3 py-1 text-[11px] font-bold border-r border-gray-300 last:border-0 transition-colors
                    ${config.naming === style ? 'bg-gray-100 text-black' : 'bg-white text-gray-500 hover:bg-gray-50'} 
                    disabled:opacity-30`}
                  onClick={() => setConfig({...config, naming: style})}
                >
                  {style === 'original' ? 'Original' : style === 'camel' ? 'CamelCase' : 'snake_case'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="flex bg-gray-100 rounded-md p-1 border border-gray-200">
            <button className={`px-2 py-1 text-[10px] font-black rounded ${config.lang === 'es' ? 'bg-white shadow-sm' : 'text-gray-400'}`} onClick={() => setConfig({...config, lang: 'es'})}>ES</button>
            <button className={`px-2 py-1 text-[10px] font-black rounded ${config.lang === 'en' ? 'bg-white shadow-sm' : 'text-gray-400'}`} onClick={() => setConfig({...config, lang: 'en'})}>EN</button>
          </div>
          
          <button 
            onClick={handleApply}
            disabled={status !== 'analyzed'}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-black text-xs transition-all tracking-tighter
              ${status === 'analyzed' 
                ? 'bg-[#F2C811] hover:bg-black hover:text-white text-black shadow-md cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Settings2 size={16} />
            APLICAR FORMATO
          </button>
        </div>
      </div>

      {/* CUERPO CENTRAL */}
      <div className="flex flex-1 overflow-hidden relative bg-[#252423]">
        
        <div className="flex flex-col w-1/2 border-r border-gray-800">
          <div className="flex justify-between items-center bg-[#1e1d1c] px-4 py-2 border-b border-gray-800">
            <span className="text-[10px] font-black text-gray-500 tracking-widest">ORIGINAL</span>
          </div>
          <textarea 
            className="flex-1 w-full bg-[#252423] text-gray-200 font-mono text-sm p-4 resize-none outline-none focus:bg-[#2b2a29] transition-colors"
            placeholder="Pegue su código de Power Query aquí..."
            value={inputCode}
            onChange={(e) => { setInputCode(e.target.value); setStatus('idle'); }}
            spellCheck="false"
          />
          <div className="bg-[#1e1d1c] p-3 flex justify-center border-t border-gray-800">
            <button 
              onClick={handleAnalyze}
              className={`flex items-center gap-2 px-10 py-2 rounded font-black text-xs transition-all border
                ${inputCode.trim() ? 'bg-white hover:bg-[#F2C811] text-black border-white' : 'bg-transparent text-gray-700 border-gray-800 cursor-not-allowed'}`}
            >
              <Play size={14} /> ANALIZAR CÓDIGO
            </button>
          </div>
        </div>

        <div className={`flex flex-col transition-all duration-300 ${isStepsOpen ? 'w-[35%]' : 'w-1/2'} border-r border-gray-800`}>
          <div className="flex justify-between items-center bg-[#1e1d1c] px-4 py-2 border-b border-gray-800">
            <span className="text-[10px] font-black text-[#F2C811] tracking-widest uppercase">Formateado</span>
            <button onClick={handleCopy} disabled={!outputCode} className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 disabled:opacity-20 uppercase">
              <Copy size={12} /> Copiar
            </button>
          </div>
          <textarea 
            readOnly
            className="flex-1 w-full bg-[#252423] text-gray-400 font-mono text-sm p-4 resize-none outline-none"
            placeholder={status === 'analyzed' ? "Listo. Configure y pulse Aplicar." : "Esperando análisis..."}
            value={outputCode}
          />
        </div>

        <div className={`bg-[#FAF9F8] flex flex-col transition-all duration-300 ${isStepsOpen ? 'w-[15%]' : 'w-0'} overflow-hidden`}>
          <div className="flex justify-between items-center bg-gray-200 px-3 py-2 border-b border-gray-300 shrink-0">
            <span className="text-[9px] font-black text-gray-600 tracking-tighter uppercase">Pasos Aplicados</span>
            <button onClick={() => setIsStepsOpen(false)} className="text-gray-400 hover:text-black"><ChevronRight size={14} /></button>
          </div>
          <div className="flex-1 p-2">
            {status !== 'analyzed' ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 text-[10px] text-center p-2 opacity-50 font-bold uppercase">
                <Database size={24} className="mb-2" />
                <p>Sin datos</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {mockSteps.map((step, idx) => (
                  <li key={idx} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded border border-transparent hover:border-gray-300 cursor-pointer group transition-all">
                    <Filter size={12} className="text-gray-400 group-hover:text-[#F2C811]"/>
                    <span className="text-[11px] font-bold text-gray-600 truncate">{step}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {!isStepsOpen && (
          <button onClick={() => setIsStepsOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#F2C811] p-1 rounded-l shadow-lg text-black"><ChevronLeft size={16} /></button>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-[#EDEBE9] border-t border-gray-300 px-4 py-1 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
          {status === 'idle' && <span className="text-gray-400">Esperando...</span>}
          {status === 'analyzed' && <><CheckCircle2 size={12} className="text-green-600"/> <span className="text-green-700">Validado</span></>}
          {status === 'error' && <><AlertCircle size={12} className="text-red-600"/> <span className="text-red-700">Error Sintaxis</span></>}
        </div>
        <div className="text-[9px] text-gray-500 font-bold flex gap-4 uppercase tracking-tighter">
          <span>Pasos: {status === 'analyzed' ? mockSteps.length : '-'}</span>
          <span>Analista: Raúl</span>
        </div>
      </div>

    </div>
  );
}