import React, { useState } from 'react';
import { 
  FileCode, Play, Copy, ChevronRight, ChevronLeft, 
  Settings2, Database, CheckCircle2, AlertCircle 
} from 'lucide-react';

/**
 * Lógica del Analizador de Código M (Integrada)
 * Esta función valida la estructura básica y extrae los pasos del script.
 */
const analyzeMCode = (code) => {
  if (!code || code.trim() === "") {
    return { success: false, error: "El código está vacío." };
  }

  try {
    // 1. Simulación de validación léxica básica
    // En un entorno real usaríamos PQP, aquí validamos estructura esencial
    const lines = code.split('\n');
    const lowerCode = code.toLowerCase();
    
    // Validación de bloques let/in
    const hasLet = lowerCode.includes("let");
    const hasIn = lowerCode.includes("in");

    if (hasLet && !hasIn) {
      return { success: false, error: "Estructura incompleta: Se encontró 'let' pero falta el bloque 'in'." };
    }

    // 2. Extracción de pasos (Regex para detectar asignaciones)
    const steps = [];
    const stepRegex = /^\s*(?:#"(.*)"|([a-zA-Z0-9._]+))\s*=/;

    lines.forEach(line => {
      const match = line.match(stepRegex);
      if (match) {
        const stepName = match[1] || match[2];
        // Evitamos capturar palabras clave como nombres de pasos
        if (stepName && !['let', 'in'].includes(stepName.trim().toLowerCase())) {
          steps.push(stepName.trim());
        }
      }
    });

    if (hasLet && steps.length === 0) {
      return { success: false, error: "No se detectaron pasos válidos después del 'let'." };
    }

    return {
      success: true,
      message: "Análisis completado correctamente.",
      steps: steps.length > 0 ? steps : ["Resultado único"],
      stats: {
        lineCount: lines.length,
        stepCount: steps.length
      }
    };

  } catch (err) {
    return {
      success: false,
      error: "Error en el motor de análisis: " + err.message
    };
  }
};

export default function App() {
  // Estados de la aplicación
  const [status, setStatus] = useState('idle'); // idle, analyzed, error
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  const [steps, setSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Opciones de configuración
  const [config, setConfig] = useState({
    indentation: '4',
    commas: 'end',
    emptyLines: false,
    naming: 'original',
    lang: 'es'
  });

  // Función de análisis
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

  // Función de formateo (Lógica de transformación)
  const handleApply = () => {
    if (status !== 'analyzed') return;
    
    let formatted = inputCode;
    
    // Aplicamos transformaciones basadas en la configuración
    if (config.emptyLines) {
      formatted = formatted.replace(/=/g, '=\n    ');
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
              className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded text-gray-700"
            >
              <FileCode size={24} className="text-[#F2C811] mb-1" />
              <span className="text-xs font-medium uppercase">Nuevo</span>
            </button>
          </div>

          <div className="px-4 flex gap-4 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Sangría</label>
              <select 
                disabled={status !== 'analyzed'}
                className="text-sm border rounded p-1 bg-gray-50 disabled:opacity-50"
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
                className="text-sm border rounded p-1 bg-gray-50 disabled:opacity-50"
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
              />
              <label htmlFor="emptyLines" className={`text-xs font-medium ${status !== 'analyzed' ? 'text-gray-400' : 'text-gray-600'}`}>Separar pasos</label>
            </div>
          </div>

          <div className="px-4 flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Nombres de Pasos</label>
            <div className="flex border rounded overflow-hidden">
              {['original', 'camel', 'snake'].map(style => (
                <button 
                  key={style}
                  disabled={status !== 'analyzed'}
                  className={`px-3 py-1 text-xs border-r last:border-0 ${config.naming === style ? 'bg-gray-200 font-bold' : 'bg-gray-50 hover:bg-gray-100'} disabled:opacity-50 uppercase`}
                  onClick={() => setConfig({...config, naming: style})}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4">
          <button 
            onClick={handleApply}
            disabled={status !== 'analyzed'}
            className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-all
              ${status === 'analyzed' 
                ? 'bg-[#F2C811] hover:bg-[#d9b30f] text-black shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Settings2 size={18} />
            APLICAR FORMATO
          </button>
        </div>
      </div>

      {/* ZONA CENTRAL */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Editor Izquierdo */}
        <div className="flex flex-col w-1/2 border-r border-gray-700 bg-[#252423]">
          <div className="flex justify-between items-center bg-[#1e1d1c] px-4 py-2 border-b border-gray-700">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Input: Código M Original</span>
          </div>
          <textarea 
            className="flex-1 w-full bg-[#252423] text-gray-100 font-mono p-4 resize-none outline-none focus:ring-1 focus:ring-[#F2C811]"
            placeholder="let&#10;    Origen = Excel.CurrentWorkbook()...&#10;in&#10;    Origen"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            spellCheck="false"
          />
          
          <div className="bg-[#1e1d1c] p-3 flex justify-center border-t border-gray-700">
            <button 
              onClick={handleAnalyze}
              className={`flex items-center gap-2 px-10 py-2.5 rounded-full font-bold transition-all
                ${inputCode.trim() ? 'bg-white hover:bg-[#F2C811] text-black shadow-lg scale-105' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            >
              <Play size={16} fill="currentColor" />
              ANALIZAR CÓDIGO
            </button>
          </div>
        </div>

        {/* Editor Derecho */}
        <div className={`flex flex-col transition-all duration-300 ${isStepsOpen ? 'w-[30%]' : 'w-1/2'} bg-[#2b2a29]`}>
          <div className="flex justify-between items-center bg-[#1e1d1c] px-4 py-2 border-b border-gray-700">
            <span className="text-[10px] font-bold text-[#F2C811] tracking-widest uppercase">Output: Vista Previa</span>
            <button 
              onClick={handleCopy}
              disabled={!outputCode}
              className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 hover:text-white disabled:opacity-10"
            >
              <Copy size={12} /> Copiar Código
            </button>
          </div>
          <textarea 
            readOnly
            className="flex-1 w-full bg-[#252423] text-gray-400 font-mono p-4 resize-none outline-none"
            placeholder={status === 'analyzed' ? "Configura las opciones y aplica el formato." : "Analiza el código para comenzar..."}
            value={outputCode}
            spellCheck="false"
          />
        </div>

        {/* Panel de Pasos */}
        <div className={`bg-white border-l border-gray-300 flex flex-col transition-all duration-300 ${isStepsOpen ? 'w-[20%]' : 'w-0'}`}>
          <div className="flex justify-between items-center bg-gray-50 px-4 py-2 border-b border-gray-200 shrink-0">
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Pasos del Query</span>
            <button onClick={() => setIsStepsOpen(false)} className="text-gray-400 hover:text-black">
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            {status !== 'analyzed' ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs text-center px-4">
                <Database size={24} className="mb-3 opacity-20" />
                <p>Analiza el código para extraer los pasos aplicados.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="group flex items-center gap-3 p-2 hover:bg-[#F2C811]/10 border border-transparent hover:border-[#F2C811]/30 rounded transition-all cursor-default">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-[#F2C811] group-hover:text-black">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-medium text-gray-600 truncate flex-1">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isStepsOpen && (
          <button 
            onClick={() => setIsStepsOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-1 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100 shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* BARRA DE ESTADO */}
      <div className={`border-t px-4 py-1.5 flex justify-between items-center shrink-0 transition-colors
        ${status === 'error' ? 'bg-red-50 border-red-200' : 'bg-[#EDEBE9] border-gray-300'}`}>
        <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-tight">
          {status === 'idle' && <span className="text-gray-500 italic">Listo para procesar</span>}
          {status === 'analyzed' && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={14} /> 
              <span>Código M verificado: {steps.length} pasos encontrados</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={14} /> 
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 items-center">
            <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">v1.0.1 (Fixed)</span>
        </div>
      </div>

    </div>
  );
}