import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { assignTrainingProgram } from '../../api/assignProgramService';
import { getTraineeProgramHistory, unassignTraineeActiveProgram } from '../../api/traineeProgramService';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/theme.css';

export default function AssignProgramPage() {
    const [trainees, setTrainees] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedTrainee, setSelectedTrainee] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [traineeSearch, setTraineeSearch] = useState("");
    const [programSearch, setProgramSearch] = useState("");
    const [traineeHistory, setTraineeHistory] = useState([]);
    const [currentProgram, setCurrentProgram] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showTraineeDetails, setShowTraineeDetails] = useState(false);
    const { user } = useAuth();
    const trainerId = user?.id;

    useEffect(() => {
        apiService.get(`/trainer/${trainerId}/trainees`).then(setTrainees).catch(() => setTrainees([]));
        apiService.get('/trainees/programs/all').then(setPrograms).catch(() => setPrograms([]));
    }, [trainerId]);

    useEffect(() => {
        if (!selectedTrainee) {
            setTraineeHistory([]);
            setCurrentProgram(null);
            return;
        }
        getTraineeProgramHistory(selectedTrainee)
            .then(history => {
                setTraineeHistory(history);
                setCurrentProgram(history.find(h => h.is_active));
            })
            .catch(() => {
                setTraineeHistory([]);
                setCurrentProgram(null);
            });
    }, [selectedTrainee]);

    const filteredTrainees = trainees.filter(t =>
        (t.first_name + ' ' + t.last_name).toLowerCase().includes(traineeSearch.toLowerCase())
    );
    const filteredPrograms = programs.filter(p =>
        p.name.toLowerCase().includes(programSearch.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        if (currentProgram) {
            setShowConfirm(true);
            return;
        }
        await doAssign();
    };
    const doAssign = async () => {
        try {
            await assignTrainingProgram(trainerId, selectedTrainee, selectedProgram);
            setSuccess(true);
            setShowConfirm(false);
            getTraineeProgramHistory(selectedTrainee).then(history => {
                setTraineeHistory(history);
                setCurrentProgram(history.find(h => h.is_active));
            });
        } catch (err) {
            setError(err.message || "שגיאה בשיוך תוכנית");
        }
    };
    const handleUnassign = async () => {
        try {
            await unassignTraineeActiveProgram(selectedTrainee);
            setCurrentProgram(null);
            setSuccess(false);
            getTraineeProgramHistory(selectedTrainee).then(setTraineeHistory);
        } catch (err) {
            setError(err.message || "שגיאה בביטול שיוך");
        }
    };

    return (
        <div className="trainer-messages-container">
            <h2>שיוך תוכנית למתאמן</h2>
            <div className="tabs">
                <button className="tab-btn selected">שיוך</button>
            </div>
            {error && <div className="toast-error">{error}</div>}
            {success && <div className="toast-success">{success}</div>}
            <div className="card-section">
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 220 }}>
                        <label>חפש מתאמן:</label>
                        <input value={traineeSearch} onChange={e => setTraineeSearch(e.target.value)} placeholder="הקלד שם..." />
                        <select value={selectedTrainee} onChange={e => setSelectedTrainee(e.target.value)} required style={{ width: '100%', marginTop: 8 }}>
                            <option value="">--בחר--</option>
                            {filteredTrainees.map(t => (
                                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                            ))}
                        </select>
                        {selectedTrainee && (
                            <button type="button" className="action-btn" style={{ marginTop: 8 }} onClick={() => setShowTraineeDetails(true)}>פרטי מתאמן</button>
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                        <label>חפש תוכנית:</label>
                        <input value={programSearch} onChange={e => setProgramSearch(e.target.value)} placeholder="הקלד שם תוכנית..." />
                        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} required style={{ width: '100%', marginTop: 8 }}>
                            <option value="">--בחר--</option>
                            {filteredPrograms.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                    <button type="submit" className="action-btn">שמור</button>
                    {currentProgram && (
                        <button type="button" className="action-btn" style={{ background: 'var(--error-color)' }} onClick={handleUnassign}>בטל שיוך</button>
                    )}
                </form>
                {currentProgram && (
                    <div className="card" style={{ marginTop: 16, background: '#232e23', borderColor: 'var(--accent-color)' }}>
                        <strong>תוכנית נוכחית:</strong> {currentProgram.program_name} (הוקצתה ב-{new Date(currentProgram.assigned_date).toLocaleDateString('he-IL')})
                    </div>
                )}
                {traineeHistory.length > 0 && (
                    <div className="card-section" style={{ marginTop: 16, background: '#181c1f' }}>
                        <strong>היסטוריית תוכניות:</strong>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {traineeHistory.map((h, i) => (
                                <li key={i} style={{ color: h.is_active ? 'var(--accent-color)' : '#fff', fontWeight: h.is_active ? 700 : 400, marginBottom: 4 }}>
                                    {h.program_name} ({h.trainer_name}) - {new Date(h.assigned_date).toLocaleDateString('he-IL')} {h.is_active ? '(פעילה)' : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {showConfirm && (
                    <div className="card-section" style={{ background: '#333', color: '#fff', marginTop: 16 }}>
                        <p>למתאמן כבר משויכת תוכנית פעילה. האם להחליף אותה?</p>
                        <button className="action-btn" onClick={doAssign}>כן, החלף</button>
                        <button className="action-btn" style={{ background: 'var(--error-color)', marginRight: 8 }} onClick={() => setShowConfirm(false)}>ביטול</button>
                    </div>
                )}
                {showTraineeDetails && selectedTrainee && (
                    <div className="card-section" style={{ background: '#232e23', color: '#fff', marginTop: 16 }}>
                        <h4 style={{ color: 'var(--accent-color)' }}>פרטי מתאמן</h4>
                        {(() => {
                            const t = trainees.find(t => t.id == selectedTrainee);
                            if (!t) return null;
                            return (
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                    <li>שם: {t.first_name} {t.last_name}</li>
                                    <li>אימייל: {t.email}</li>
                                    <li>טלפון: {t.phone}</li>
                                </ul>
                            );
                        })()}
                        <button className="action-btn" onClick={() => setShowTraineeDetails(false)} style={{ marginTop: 8 }}>סגור</button>
                    </div>
                )}
            </div>
        </div>
    );
}
