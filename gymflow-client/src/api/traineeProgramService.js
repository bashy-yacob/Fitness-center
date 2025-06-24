import apiService from './apiService';

// היסטוריית תוכניות אימון למתאמן
export async function getTraineeProgramHistory(traineeId) {
    return apiService.get(`/trainees/${traineeId}/programs/history`);
}

// ביטול שיוך תוכנית פעילה
export async function unassignTraineeActiveProgram(traineeId) {
    return apiService.post(`/trainees/${traineeId}/programs/unassign`);
}
