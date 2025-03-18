import { useState } from 'react';

const UnpackUtility = () => {
  const [files, setFiles] = useState([]);
  const [recursive, setRecursive] = useState(false);
  const [verbose, setVerbose] = useState(false);
  const [output, setOutput] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ decompressed: 0, failed: 0 });

  // Mock implementation of the bash script functionality
  const processFiles = () => {
    setIsProcessing(true);
    setOutput([]);
    
    const newOutput = [];
    let decompressedCount = 0;
    let failedCount = 0;

    // Simulate processing with a delay for UI feedback
    setTimeout(() => {
      // Process each file
      files.forEach(file => {
        const fileName = file.name;
        const fileType = getFileType(fileName);
        
        if (fileType) {
          if (verbose) {
            newOutput.push(`Unpacking ${fileName}...`);
          }
          newOutput.push(`Successfully decompressed ${fileName}`);
          decompressedCount++;
        } else {
          if (verbose) {
            newOutput.push(`Ignoring ${fileName} (unsupported format)`);
          }
          failedCount++;
        }
      });

      newOutput.push(`Decompressed ${decompressedCount} archive(s)`);
      if (failedCount > 0) {
        newOutput.push(`Failed to decompress ${failedCount} file(s)`);
      }

      setOutput(newOutput);
      setStats({ decompressed: decompressedCount, failed: failedCount });
      setIsProcessing(false);
    }, 1500);
  };

  // Simple file type detection based on extension
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const supportedFormats = ['gz', 'bz2', 'zip', 'cmpr', 'z'];
    return supportedFormats.includes(extension);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length > 0) {
      processFiles();
    } else {
      setOutput(['Please select at least one file']);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Unpack Utility</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">
            Select files to decompress:
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            className="block w-full text-gray-700 border border-gray-300 rounded py-2 px-3 mb-2"
          />
          <p className="text-sm text-gray-500">
            Supported formats: .gz, .bz2, .zip, .cmpr, .Z
          </p>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recursive"
              checked={recursive}
              onChange={() => setRecursive(!recursive)}
              className="mr-2"
            />
            <label htmlFor="recursive" className="text-gray-700">
              Recursive (-r)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verbose"
              checked={verbose}
              onChange={() => setVerbose(!verbose)}
              className="mr-2"
            />
            <label htmlFor="verbose" className="text-gray-700">
              Verbose (-v)
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isProcessing || files.length === 0}
          className={`py-2 px-4 rounded font-medium ${
            isProcessing || files.length === 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Unpack Files'}
        </button>
      </form>
      
      {output.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Output:</h2>
          <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-60">
            {output.map((line, index) => (
              <div key={index} className="mb-1">
                {line.startsWith('Failed') ? (
                  <span className="text-red-400">{line}</span>
                ) : line.includes('Successfully') ? (
                  <span className="text-green-400">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {stats.decompressed > 0 && (
        <div className="mt-6 flex space-x-6">
          <div className="bg-green-100 p-3 rounded text-center flex-1">
            <span className="block text-2xl font-bold text-green-700">
              {stats.decompressed}
            </span>
            <span className="text-green-700">Decompressed</span>
          </div>
          
          <div className="bg-red-100 p-3 rounded text-center flex-1">
            <span className="block text-2xl font-bold text-red-700">
              {stats.failed}
            </span>
            <span className="text-red-700">Failed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnpackUtility;