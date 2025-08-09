import React, { useState } from 'react';
import { FileText, X, Upload, Eye, Download, AlertCircle, Image as ImageIcon, ZoomIn, File } from 'lucide-react';

class DocumentHandler {
  constructor() {
    this.allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    this.maxSize = 5 * 1024 * 1024; // 5MB
    this.maxFiles = 5;
  }

  validateFile(file) {
    const errors = [];
    
    if (!this.allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Only images, PDF, and Word documents are allowed.`);
    }
    
    if (file.size > this.maxSize) {
      errors.push(`File size too large. Maximum size is ${this.formatFileSize(this.maxSize)}.`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFiles(files, currentFiles = []) {
    const allErrors = [];
    const validFiles = [];
    
    if (currentFiles.length + files.length > this.maxFiles) {
      allErrors.push(`Maximum ${this.maxFiles} files allowed`);
      return { isValid: false, errors: allErrors, validFiles };
    }
    
    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        allErrors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      validFiles
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType) {
    if (fileType && fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType && (fileType.includes('word') || fileType.includes('document'))) {
      return '📝';
    }
    return '📁';
  }

  // New method to check if file is an image
  isImageFile(filename, mimetype) {
    if (mimetype && mimetype.startsWith('image/')) return true;
    if (!filename) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  // New method to check if file is PDF
  isPdfFile(filename, mimetype) {
    if (mimetype === 'application/pdf') return true;
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
  }
}

// Document Upload Component (unchanged)
const DocumentUploadComponent = ({ 
  documents = [], 
  onDocumentsChange, 
  onError,
  disabled = false,
  maxFiles = 5,
  label = "Supporting Documents",
  description = "Optional - Max 5 files, 5MB each"
}) => {
  const [dragOver, setDragOver] = useState(false);
  const documentHandler = new DocumentHandler();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validation = documentHandler.validateFiles(files, documents);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => onError(error));
      return;
    }

    if (validation.validFiles.length > 0) {
      onDocumentsChange([...documents, ...validation.validFiles]);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = documents.filter((_, i) => i !== index);
    onDocumentsChange(updatedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="text-xs text-gray-500 ml-1">({description})</span>
      </label>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : documents.length >= maxFiles
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          disabled={disabled || documents.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center py-6">
          <Upload className={`w-8 h-8 mb-2 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600 text-center">
            {documents.length >= maxFiles ? (
              <span className="text-red-500">Maximum files reached</span>
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
                <br />
                <span className="text-xs">PNG, JPG, PDF, DOC up to 5MB</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* File List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Selected Files ({documents.length}/{maxFiles}):
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {documents.map((file, index) => (
              <DocumentItem
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
                documentHandler={documentHandler}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Document Item Component (unchanged)
const DocumentItem = ({ file, onRemove, documentHandler }) => {
  const [preview, setPreview] = useState(null);

  const handlePreview = () => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <span className="text-lg">{documentHandler.getFileIcon(file.type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            {documentHandler.formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {file.type.startsWith('image/') && (
          <button
            type="button"
            onClick={handlePreview}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Remove"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Image Preview Modal */}
      {preview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <div className="max-w-4xl max-h-4xl p-4">
            <img 
              src={preview} 
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ENHANCED Document List Component with inline image previews
const DocumentListComponent = ({ 
  documents = [], 
  onDownload, 
  onView, 
  onDelete, 
  readOnly = false,
  apiUrl = 'http://localhost:5000/api/claims',
  showInlineImages = true,
  layout = 'list' // 'list' or 'grid'
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const documentHandler = new DocumentHandler();

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
        <FileText className="mx-auto h-8 w-8 mb-2" />
        <p className="text-sm">No documents uploaded</p>
      </div>
    );
  }

  const getImageUrl = (document) => {
    return `${apiUrl}/documents/${document.filename}/view`;
  };

  const handleImageError = (filename) => {
    setImageErrors(prev => ({ ...prev, [filename]: true }));
  };

  const getFileIconComponent = (doc) => {
    if (documentHandler.isImageFile(doc.filename || doc.original_name, doc.mimetype)) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    } else if (documentHandler.isPdfFile(doc.filename || doc.original_name, doc.mimetype)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  if (layout === 'grid' && showInlineImages) {
    return (
      <>
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            Documents ({documents.length}):
          </p>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                {/* Header with file info and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIconComponent(doc)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={doc.original_name || doc.name}>
                        {doc.original_name || doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {documentHandler.formatFileSize(doc.size)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-1 ml-2">
                    {onView && (
                      <button
                        onClick={() => onView(doc)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View in new tab"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {onDownload && (
                      <button
                        onClick={() => onDownload(doc)}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    {!readOnly && onDelete && (
                      <button
                        onClick={() => onDelete(doc, index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Preview or File Placeholder */}
                {documentHandler.isImageFile(doc.filename || doc.original_name, doc.mimetype) ? (
                  <div className="relative group">
                    {!imageErrors[doc.filename] ? (
                      <img
                        src={getImageUrl(doc)}
                        alt={doc.original_name || doc.name}
                        className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(doc)}
                        onError={() => handleImageError(doc.filename)}
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                          <div className="text-xs">Preview unavailable</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                ) : documentHandler.isPdfFile(doc.filename || doc.original_name, doc.mimetype) ? (
                  <div 
                    className="w-full h-32 bg-red-50 border border-red-200 rounded flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => onView && onView(doc)}
                  >
                    <div className="text-center text-red-600">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">PDF Document</div>
                      <div className="text-xs">Click to view</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <File className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm">Document</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Full-size image modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              
              <img
                src={getImageUrl(selectedImage)}
                alt={selectedImage.original_name || selectedImage.filename}
                className="max-w-full max-h-screen object-contain rounded"
                onClick={() => setSelectedImage(null)}
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b">
                <div className="text-sm font-medium">
                  {selectedImage.original_name || selectedImage.filename}
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  Click anywhere to close • 
                  <button 
                    onClick={() => onDownload && onDownload(selectedImage)}
                    className="ml-2 underline hover:no-underline"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Original list layout (with optional inline previews)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Documents ({documents.length}):
      </p>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
            {/* File info and actions row */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIconComponent(doc)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.original_name || doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {documentHandler.formatFileSize(doc.size)} • Uploaded
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {onView && (
                  <button
                    onClick={() => onView(doc)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                {onDownload && (
                  <button
                    onClick={() => onDownload(doc)}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
                {!readOnly && onDelete && (
                  <button
                    onClick={() => onDelete(doc, index)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Inline image preview (if enabled and is image) */}
            {showInlineImages && documentHandler.isImageFile(doc.filename || doc.original_name, doc.mimetype) && (
              <div className="px-3 pb-3">
                {!imageErrors[doc.filename] ? (
                  <img
                    src={getImageUrl(doc)}
                    alt={doc.original_name || doc.name}
                    className="w-full max-w-xs h-24 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(doc)}
                    onError={() => handleImageError(doc.filename)}
                  />
                ) : (
                  <div className="w-full max-w-xs h-24 bg-gray-200 rounded border flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-xs">Preview unavailable</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            <img
              src={getImageUrl(selectedImage)}
              alt={selectedImage.original_name || selectedImage.filename}
              className="max-w-full max-h-screen object-contain rounded"
              onClick={() => setSelectedImage(null)}
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b">
              <div className="text-sm font-medium">
                {selectedImage.original_name || selectedImage.filename}
              </div>
              <div className="text-xs text-gray-300 mt-1">
                Click anywhere to close • 
                <button 
                  onClick={() => onDownload && onDownload(selectedImage)}
                  className="ml-2 underline hover:no-underline"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { DocumentHandler, DocumentUploadComponent, DocumentListComponent, DocumentItem };