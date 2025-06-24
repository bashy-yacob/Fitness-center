import React, { useEffect, useState } from 'react';
import apiService from '../../api/apiService';
import { assignTrainingProgram } from '../../api/assignProgramService';
import { useAuth } from '../../hooks/useAuth';

export default function AssignProgramPage() {
    const [trainees, setTrainees] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedTrainee, setSelectedTrainee] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const trainerId = user?.id;

    useEffect(() => {
        // שליפת מתאמנים של המאמן
        apiService.get(`/trainer/${trainerId}/trainees`).then(setTrainees).catch(() => setTrainees([]));
        // שליפת כל תוכניות האימון
        apiService.get('/trainees/programs/all').then(setPrograms).catch(() => setPrograms([]));
    }, [trainerId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        try {
            await assignTrainingProgram(trainerId, selectedTrainee, selectedProgram);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'שגיאה בשיוך תוכנית');
        }
    };

    return (
        <div className="assign-program-page" style={{ maxWidth: 500, margin: 'auto', padding: 24 }}>
            <h2>שיוך תוכנית אימון למתאמן</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>בחר מתאמן:</label>
                    <select value={selectedTrainee} onChange={e => setSelectedTrainee(e.target.value)} required>
                        <option value="">--בחר--</option>
                        {trainees.map(t => (
                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginTop: 16 }}>
                    <label>בחר תוכנית אימון:</label>
                    <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} required>
                        <option value="">--בחר--</option>
                        {programs.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" style={{ marginTop: 24 }}>שמור</button>
            </form>
            {success && <div style={{ color: 'green', marginTop: 16 }}>תוכנית שויכה בהצלחה!</div>}
            {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
        </div>
    );
}
