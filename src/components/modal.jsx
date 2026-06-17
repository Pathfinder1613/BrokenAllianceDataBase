import { useEffect } from 'react';

import '../Styles/modal.css';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, accentColor, className = '', children }) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className='modal-backdrop' onClick={onClose}>
            <div
                className={`modal-box ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className='modal-header' style={{ borderColor: accentColor ?? '#ffffff' }}>
                        <h2 className='modal-title' style={{ color: accentColor ?? '#ffffff' }}>
                            {title}
                        </h2>
                        <button className='modal-close-btn' onClick={onClose} aria-label='Close'>
                            ✕
                        </button>
                    </div>
                )}

                <div className='modal-body'>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
