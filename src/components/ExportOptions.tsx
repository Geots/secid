import { ExportFormat } from '@/types';
import { FaFileExport, FaFileCode, FaFileCsv, FaFileAlt, FaDownload } from 'react-icons/fa';

interface ExportOptionsProps {
  onExport: (format: ExportFormat) => void;
}

export default function ExportOptions({ onExport }: ExportOptionsProps) {
  const exportFormats: { format: ExportFormat; label: string; icon: React.ReactNode; color: string }[] = [
    { format: 'json', label: 'JSON', icon: <FaFileCode className="w-5 h-5" />, color: 'bg-editor-accent/20 border-editor-accent/30 text-editor-accent' },
    { format: 'csv', label: 'CSV', icon: <FaFileCsv className="w-5 h-5" />, color: 'bg-editor-string/20 border-editor-string/30 text-editor-string' },
    { format: 'sql', label: 'SQL', icon: <FaFileAlt className="w-5 h-5" />, color: 'bg-editor-keyword/20 border-editor-keyword/30 text-editor-keyword' },
    { format: 'xml', label: 'XML', icon: <FaFileExport className="w-5 h-5" />, color: 'bg-editor-function/20 border-editor-function/30 text-editor-function' },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium text-editor-function mb-5 flex items-center">
        <FaDownload className="mr-2 text-editor-accent" />
        Export Data
      </h2>
      <div className="grid grid-cols-2 gap-5 max-w-xs mx-auto sm:max-w-none">
        {exportFormats.map(({ format, label, icon, color }) => (
          <button
            key={format}
            onClick={() => onExport(format)}
            className={`flex flex-col items-center justify-center p-4 border rounded-md shadow-sm text-sm font-medium hover:shadow-md hover:scale-105 transition-all duration-200 ${color}`}
          >
            <div className="mb-2">{icon}</div>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 