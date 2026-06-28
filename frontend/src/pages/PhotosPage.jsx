import React, { useState, useEffect, useRef } from 'react';
import ImageCard from '../components/cards/ImageCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { getPhotos, uploadPhotos } from '../services/api';
import './PhotosPage.css';

const PhotosPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getPhotos();
      console.log('Photos loaded:', data);
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      await uploadPhotos(files, 'project-1');
      alert(`Successfully uploaded ${files.length} photo(s)`);
      loadPhotos();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const togglePhotoSelection = (photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.image_id === photo.image_id);
      if (isSelected) {
        return prev.filter(p => p.image_id !== photo.image_id);
      } else {
        return [...prev, photo];
      }
    });
  };

  const handleExportSelected = () => {
    if (selectedPhotos.length === 0) {
      alert('Please select photos to export');
      return;
    }
    alert(`Exporting ${selectedPhotos.length} photo(s)`);
  };

  const filteredPhotos = photos.filter(photo => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (photo.description || '').toLowerCase().includes(term) ||
      (photo.category || '').toLowerCase().includes(term) ||
      (photo.original_filename || '').toLowerCase().includes(term)
    );
  });

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.uploaded_at) - new Date(a.uploaded_at);
    } else if (sortBy === 'oldest') {
      return new Date(a.uploaded_at) - new Date(b.uploaded_at);
    }
    return 0;
  });

  if (loading) {
    return <LoadingSpinner text="Loading photos..." />;
  }

  return (
    <div className="photos-page">
      <div className="photos-header">
        <div>
          <h1 className="page-title">Site Photos</h1>
          <p className="page-description">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} in gallery
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          📤 Upload Photos
        </Button>
      </div>

      <div className="photos-toolbar">
        <input
          type="text"
          className="photos-search"
          placeholder="Search photos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="photos-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        {selectedPhotos.length > 0 && (
          <Button variant="outline" onClick={handleExportSelected}>
            📥 Export Selected ({selectedPhotos.length})
          </Button>
        )}
      </div>

      {sortedPhotos.length === 0 ? (
        <EmptyState
          icon="📷"
          title="No photos found"
          description={searchTerm ? "Try a different search term" : "Upload photos to get started"}
          action={
            !searchTerm && (
              <Button onClick={() => setShowUploadModal(true)}>
                Upload Photos
              </Button>
            )
          }
        />
      ) : (
        <div className="photos-grid">
          {sortedPhotos.map((photo) => (
            <ImageCard
              key={photo.image_id}
              image={photo}
              onSelect={togglePhotoSelection}
              isSelected={selectedPhotos.some(p => p.image_id === photo.image_id)}
              onClick={() => setSelectedImage(photo)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Photos"
        size="md"
      >
        <div
          className="upload-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-dropzone-content">
            <span className="upload-icon">📁</span>
            <p className="upload-text">
              {uploading ? 'Uploading...' : 'Drag & drop photos here or click to browse'}
            </p>
            <p className="upload-hint">Supports: JPG, PNG (multiple files allowed)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
        {uploading && (
          <div style={{ marginTop: '1rem' }}>
            <LoadingSpinner size="sm" text="Processing upload..." />
          </div>
        )}
      </Modal>

      {/* Image Detail Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Photo Details"
        size="lg"
      >
        {selectedImage && (
          <div className="image-detail">
            <img
              src={selectedImage.image_url}
              alt={selectedImage.description}
              className="image-detail-photo"
            />
            <div className="image-detail-info">
              <p><strong>Category:</strong> {selectedImage.category}</p>
              <p><strong>Status:</strong> {selectedImage.status}</p>
              <p><strong>AI Status:</strong> {selectedImage.ai_status}</p>
              <p><strong>Uploaded:</strong> {new Date(selectedImage.uploaded_at).toLocaleDateString()}</p>
              <p><strong>Description:</strong> {selectedImage.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotosPage;
