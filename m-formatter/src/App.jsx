import React, { useState } from 'react';
import { 
  FileCode, Play, Copy, ChevronRight, ChevronLeft, 
  Settings2, Database, CheckCircle2, AlertCircle 
} from 'lucide-react';

/**
 * LÓGICA DEL ANALIZADOR AVANZADO
 */
const analyzeMCode = (code) => {
  if (!code || code.trim() === "") {
    return { success: false, error: "El código está vacío." };
  }

  try {
    const lowerCode = code.toLowerCase();
    
    // 1. Validación estricta de 'let' e 'in'
    const hasLet = /\blet\b/.test(lowerCode);
    const hasIn = /\bin\b/.test(lowerCode);

    if (!hasLet || !hasIn) {
      if (!hasLet && !hasIn) {
        return { success: false, error: "Error: No se detectó la estructura obligatoria 'let...in'." };
      }
      if (hasLet) {
        return { success: false, error: "Error de sintaxis: Se encontró 'let' pero falta el bloque 'in' al final." };
      }
      return { success: false, error: "Error de sintaxis: Se encontró 'in' pero falta el bloque 'let' inicial." };
    }

    // 2. Validación de símbolos y comillas
    let parens = 0, brackets = 0, braces = 0, inString = false;
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (char === '"') {
         if (inString && code[i+1] === '"') { i++; continue; }
         inString = !inString;
      }
      if (!inString) {
        if (char === '(') parens++; if (char === ')') parens--;
        if (char === '[') brackets++; if (char === ']') brackets--;
        if (char === '{') braces++; if (char === '}') braces--;
        if (parens < 0 || brackets < 0 || braces < 0) return { success: false, error: "Error: Símbolos de cierre sin apertura." };
      }
    }

    if (inString) return { success: false, error: "Error: Comillas sin cerrar." };
    if (parens > 0 || brackets > 0 || braces > 0) return { success: false, error: "Error: Símbolos de agrupación sin cerrar." };

    const steps = [];
    const stepRegex = /^\s*(?:#"(.*?)"|([a-zA-Z0-9._]+))\s*=/gm;
    let match;
    while ((match = stepRegex.exec(code)) !== null) {
        const stepName = match[1] || match[2];
        if (stepName && !['let', 'in'].includes(stepName.trim().toLowerCase())) {
          steps.push(stepName.trim());
        }
    }

    return {
      success: true,
      steps: steps.length > 0 ? steps : ["Paso único"],
      stats: { lineCount: code.split('\n').length, stepCount: steps.length }
    };
  } catch (err) {
    return { success: false, error: "Error: " + err.message };
  }
};

export default function App() {
  const [status, setStatus] = useState('idle');
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  const [steps, setSteps] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [config, setConfig] = useState({
    indentation: '4',
    commas: 'end',
    emptyLines: false,
    naming: 'original'
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

  /**
   * MOTOR DE FORMATEO PROFESIONAL V1.6.1
   * Corrección: Mantenimiento de identificadores escapados (#" ") en estilo original.
   */
  const handleApply = () => {
    if (status !== 'analyzed') return;
    
    const indentStr = config.indentation === 'tab' ? '\t' : ' '.repeat(parseInt(config.indentation));

    /**
     * Transforma el nombre según el estilo, pero asegura que si el nombre
     * resultante requiere escape en Power Query, lo incluya.
     */
    const transformName = (name, style) => {
      let baseName = name;
      
      if (style !== 'original') {
        const clean = name.replace(/#"|"/g, '');
        const words = clean.split(/[^a-zA-Z0-9]+/).filter(Boolean);
        if (style === 'camel') {
          baseName = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        } else if (style === 'snake') {
          baseName = words.map(w => w.toLowerCase()).join('_');
        }
      }

      // Validación de identificador simple en Power Query:
      // Debe empezar por letra o _ y contener solo letras, números, puntos o guiones bajos.
      // Si tiene espacios, caracteres especiales (ñ, á) o empieza por número, requiere #" "
      const isSimpleIdentifier = /^[a-zA-Z_][a-zA-Z0-9._]*$/.test(baseName);
      return isSimpleIdentifier ? baseName : `#"${baseName}"`;
    };

    /**
     * Determina si un bloque debe expandirse (multilínea).
     */
    const shouldExpandBlock = (text, startIndex, opener, closer) => {
      let depth = 0;
      let inString = false;
      for (let i = startIndex + 1; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          if (inString && text[i+1] === '"') { i++; continue; }
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (char === opener) depth++;
        if (char === closer) {
          if (depth === 0) return false;
          depth--;
        }
        if (char === ',' && depth === 0) return true;
      }
      return false;
    };

    const formatMContent = (text, baseLevel) => {
      let result = indentStr.repeat(baseLevel);
      let level = 0;
      let inString = false;
      const expandStack = [];
      const cleanText = text.replace(/\s+/g, ' ').trim();

      for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];

        if (char === '"') {
          if (inString && cleanText[i+1] === '"') { result += '""'; i++; continue; }
          inString = !inString;
          result += char;
          continue;
        }

        if (inString) {
          result += char;
          continue;
        }

        if ("([{".includes(char)) {
          const closer = char === '(' ? ')' : char === '[' ? ']' : '}';
          const expand = shouldExpandBlock(cleanText, i, char, closer);
          expandStack.push(expand);

          if (expand) {
            level++;
            result += char + "\n" + indentStr.repeat(baseLevel + level);
          } else {
            result += char;
          }
        } else if (")]}".includes(char)) {
          const expand = expandStack.pop();
          if (expand) {
            level = Math.max(0, level - 1);
            result = result.trimEnd();
            result += "\n" + indentStr.repeat(baseLevel + level) + char;
          } else {
            result += char;
          }
        } else if (char === ",") {
          const currentExpand = expandStack[expandStack.length - 1];
          if (currentExpand) {
            result += char + "\n" + indentStr.repeat(baseLevel + level);
          } else {
            result += char + " ";
          }
        } else {
          if (char === " " && (result.endsWith(" ") || result.endsWith("\n") || result.endsWith(indentStr))) continue;
          result += char;
        }
      }
      return result;
    };

    try {
      const letIndex = inputCode.toLowerCase().indexOf('let');
      const inIndex = inputCode.toLowerCase().lastIndexOf('in');
      
      let body = inputCode.substring(letIndex + 3, inIndex);
      let resultStep = inputCode.substring(inIndex + 2).trim();

      // Mapeo de integridad referencial
      const nameMapping = steps.map(s => ({
        originalEscaped: s.includes(" ") || !/^[a-zA-Z_][a-zA-Z0-9._]*$/.test(s) ? `#"${s}"` : s,
        nuevo: transformName(s, config.naming)
      }));

      const sortedMapping = [...nameMapping].sort((a, b) => b.originalEscaped.length - a.originalEscaped.length);
      sortedMapping.forEach(map => {
        const regex = new RegExp(map.originalEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        body = body.replace(regex, map.nuevo);
        resultStep = resultStep.replace(regex, map.nuevo);
      });

      const stepRegex = /^\s*(?:#"(.*?)"|([a-zA-Z0-9._]+))\s*=/gm;
      let match;
      const stepDefinitions = [];
      while ((match = stepRegex.exec(body)) !== null) {
        stepDefinitions.push({ name: match[1] || match[2], start: match.index, fullMatch: match[0] });
      }

      const formattedSteps = stepDefinitions.map((def, i) => {
        const nextStart = stepDefinitions[i + 1] ? stepDefinitions[i + 1].start : body.length;
        let content = body.substring(def.start + def.fullMatch.length, nextStart).trim();
        if (content.endsWith(',')) content = content.slice(0, -1).trim();

        const formattedBody = formatMContent(content, 2);
        const lineSpacing = config.emptyLines ? '\n' : '';
        const currentDisplayName = transformName(def.name, config.naming);

        if (config.commas === 'start') {
          const prefix = i === 0 ? ' ' : ',';
          return `${indentStr}${prefix} ${currentDisplayName} =\n${formattedBody}${lineSpacing}`;
        } else {
          const suffix = i === stepDefinitions.length - 1 ? '' : ',';
          return `${indentStr}${currentDisplayName} =\n${formattedBody}${suffix}${lineSpacing}`;
        }
      });

      const finalResult = formatMContent(resultStep, 1);
      const output = [
        "let",
        formattedSteps.join('\n'),
        "in",
        finalResult
      ].join('\n');

      setOutputCode(`// M-Formatter Professional v1.6.1\n// Estilo: ${config.naming.toUpperCase()}\n\n` + output);

    } catch (err) {
      setOutputCode(`// Error técnico: ${err.message}`);
    }
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
      
      {/* RIBBON */}
      <div className="bg-white border-b border-gray-300 flex items-center justify-between p-2 shadow-sm shrink-0 z-10">
        <div className="flex items-center space-x-6 divide-x divide-gray-200">
          <div className="px-4 flex flex-col items-center">
            <button 
              onClick={() => { setInputCode(''); setStatus('idle'); setSteps([]); setOutputCode(''); }}
              className="flex flex-col items-center justify-center p-1.5 hover:bg-gray-100 rounded text-gray-700 transition-colors"
            >
              <FileCode size={22} className="text-[#F2C811] mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Limpiar</span>
            </button>
          </div>

          <div className="px-4 flex gap-6 items-center">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Sangría</label>
              <select 
                className="text-[11px] border border-gray-300 rounded px-1 h-7 bg-gray-50 outline-none focus:border-[#F2C811]"
                value={config.indentation}
                onChange={(e) => setConfig({...config, indentation: e.target.value})}
              >
                <option value="2">2 espacios</option>
                <option value="4">4 espacios</option>
                <option value="tab">Tabulación</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Comas</label>
              <select 
                className="text-[11px] border border-gray-300 rounded px-1 h-7 bg-gray-50 outline-none focus:border-[#F2C811]"
                value={config.commas}
                onChange={(e) => setConfig({...config, commas: e.target.value})}
              >
                <option value="end">Al final</option>
                <option value="start">Al inicio</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <input 
                type="checkbox" 
                id="emptyLines" 
                checked={config.emptyLines} 
                onChange={(e) => setConfig({...config, emptyLines: e.target.checked})} 
                className="accent-[#F2C811] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="emptyLines" className="text-[10px] font-bold text-gray-600 uppercase cursor-pointer tracking-tighter">
                Espacios Extra
              </label>
            </div>
          </div>

          <div className="px-4 flex flex-col gap-1">
            <label className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Nombres</label>
            <div className="flex border border-gray-300 rounded overflow-hidden h-7">
              {['original', 'camel', 'snake'].map(style => (
                <button 
                  key={style}
                  className={`px-3 text-[10px] font-bold uppercase transition-colors 
                    ${config.naming === style ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'} 
                    border-r last:border-0 border-gray-300`}
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
            className={`flex items-center gap-2 px-8 py-2 rounded font-black text-xs tracking-widest transition-all transform active:scale-95
              ${status === 'analyzed' 
                ? 'bg-[#F2C811] hover:bg-black hover:text-white text-black shadow-lg shadow-[#F2C811]/20' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Settings2 size={16} />
            APLICAR FORMATO
          </button>
        </div>
      </div>

      {/* ÁREA DE EDITORES */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-col w-1/2 border-r border-gray-700 bg-[#252423]">
          <div className="bg-[#1e1d1c] px-4 py-1.5 border-b border-gray-800 flex justify-between">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Input // Script M</span>
          </div>
          <textarea 
            className="flex-1 w-full bg-[#252423] text-[#D4D4D4] font-mono p-5 resize-none outline-none leading-relaxed selection:bg-[#F2C811] selection:text-black"
            value={inputCode}
            onChange={(e) => { setInputCode(e.target.value); if (status !== 'idle') setStatus('idle'); }}
            spellCheck="false"
          />
          <div className="bg-[#1e1d1c] p-3 flex justify-center border-t border-gray-800">
            <button 
              onClick={handleAnalyze}
              className={`flex items-center gap-3 px-10 py-2.5 rounded-full font-black text-xs tracking-widest transition-all
                ${inputCode.trim() ? 'bg-white hover:bg-[#F2C811] text-black shadow-xl scale-105 active:scale-95' : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'}`}
            >
              <Play size={14} fill="currentColor" />
              ANALIZAR CÓDIGO
            </button>
          </div>
        </div>

        <div className={`flex flex-col transition-all duration-500 ease-in-out ${isStepsOpen ? 'w-[30%]' : 'w-1/2'} bg-[#2b2a29]`}>
          <div className="flex justify-between items-center bg-[#1e1d1c] px-4 py-1.5 border-b border-gray-800">
            <span className="text-[9px] font-black text-[#F2C811] uppercase tracking-widest">Output // Preview</span>
            <button onClick={handleCopy} disabled={!outputCode} className="text-[9px] font-black uppercase text-gray-500 hover:text-white disabled:opacity-0 transition-all">
              <Copy size={12} className="inline mr-1" /> Copiar
            </button>
          </div>
          <textarea readOnly className="flex-1 w-full bg-[#1e1d1c] text-gray-400 font-mono p-5 resize-none outline-none italic" value={outputCode} placeholder="..." spellCheck="false" />
        </div>

        <div className={`bg-white border-l border-gray-300 flex flex-col transition-all duration-500 ease-in-out ${isStepsOpen ? 'w-[20%]' : 'w-0 overflow-hidden'}`}>
          <div className="flex justify-between items-center bg-gray-100 px-4 py-2.5 border-b border-gray-200 shrink-0">
            <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase italic">Estructura</span>
            <button onClick={() => setIsStepsOpen(false)} className="text-gray-400 hover:text-black transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#F9F9F9]">
            {status !== 'analyzed' ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 text-[9px] text-center px-4 space-y-3">
                <Database size={24} className="opacity-10" />
                <p className="uppercase font-bold tracking-tighter leading-relaxed">Analiza para ver la estructura de pasos</p>
              </div>
            ) : (
              steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 truncate shadow-sm">
                  <span className="w-4 h-4 rounded-full bg-[#F2C811] text-black flex items-center justify-center text-[8px] shrink-0">{idx + 1}</span>
                  {step}
                </div>
              ))
            )}
          </div>
        </div>

        {!isStepsOpen && (
          <button onClick={() => setIsStepsOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-1.5 border border-r-0 border-gray-300 rounded-l-lg hover:bg-[#F2C811] shadow-xl transition-all"><ChevronLeft size={16} /></button>
        )}
      </div>

      <div className={`border-t px-5 py-2 flex justify-between items-center shrink-0 transition-all duration-500
        ${status === 'error' ? 'bg-[#C42B1C] text-white' : 
          status === 'analyzed' ? 'bg-[#107C10] text-white' : 
          'bg-[#EDEBE9] text-gray-600'}`}>
        
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          {status === 'idle' && <span>Sistema Listo</span>}
          {status === 'analyzed' && <div className="flex items-center gap-2"><CheckCircle2 size={14} /> <span>CÓDIGO VÁLIDO // {steps.length} PASOS</span></div>}
          {status === 'error' && <div className="flex items-center gap-2"><AlertCircle size={14} /> <span>{errorMessage}</span></div>}
        </div>
        <span className="text-[9px] font-black opacity-60 uppercase tracking-tighter italic">M-Formatter Professional V1.6.1</span>
      </div>
    </div>
  );
}