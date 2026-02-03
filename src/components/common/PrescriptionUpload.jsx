
import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import './PrescriptionUpload.css';

const PrescriptionUpload = ({ onClose }) => {
    const { addPrescription } = useData();
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [notes, setNotes] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selected);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !user) return;

        setIsSubmitting(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, you would upload to storage here and get a URL
        // For this demo, we use the base64 preview as the URL
        const prescriptionData = {
            userId: user.id || 'guest',
            userName: user.name || 'Guest User',
            userPhone: user.phone || 'N/A',
            imageUrl: preview,
            fileName: file.name,
            userNotes: notes
        };

        addPrescription(prescriptionData);
        setIsSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    if (success) {
        return (
            <div className="prescription-upload-container success-state">
                <CheckCircle size={48} className="success-icon" />
                <h3>Upload Successful!</h3>
                <p>Your prescription has been sent for review.</p>
                <p className="timer-text">Closing...</p>
            </div>
        );
    }

    return (
        <div className="prescription-upload-container animate-fade">
            <div className="upload-header">
                <h3>Upload Prescription</h3>
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
                {!preview ? (
                    <div className="upload-area">
                        <input
                            type="file"
                            id="presc-upload"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            hidden
                        />
                        <label htmlFor="presc-upload" className="upload-label">
                            <Upload size={32} />
                            <span>Click to upload image or PDF</span>
                            <small>Max size: 5MB</small>
                        </label>
                    </div>
                ) : (
                    <div className="preview-area">
                        <img src={preview} alt="Prescription preview" className="preview-img" />
                        <button type="button" className="remove-btn" onClick={() => { setFile(null); setPreview(null); }}>
                            <Trash2 size={16} /> Remove
                        </button>
                    </div>
                )}

                <div className="form-group">
                    <label>Additional Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="E.g. I need 2 strips of the second medicine..."
                        rows="3"
                    />
                </div>

                <div className="info-box">
                    <AlertCircle size={16} />
                    <p>Our pharmacists will review your prescription and create an order for you.</p>
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={!file || isSubmitting}
                >
                    {isSubmitting ? 'Uploading...' : 'Submit Prescription'}
                </button>
            </form>
        </div>
    );
};

// Simple Trash Icon component locally to avoid import issues if not available in parent
const Trash2 = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export default PrescriptionUpload;
