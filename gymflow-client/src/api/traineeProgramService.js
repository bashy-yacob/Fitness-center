// שירותים להיסטוריית תוכניות וביטול שיוך
import apiService from './apiService';

export async function getTraineeProgramHistory(traineeId) {
    return apiService.get(`/trainees/${traineeId}/programs/history`);
}

export async function unassignTraineeActiveProgram(traineeId) {
    return apiService.post(`/trainees/${traineeId}/programs/unassign`);
}
