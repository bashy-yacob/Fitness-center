import apiService from '../api/apiService';

// שיוך תוכנית אימון למתאמן
export async function assignTrainingProgram(trainerId, traineeId, programId) {
    return apiService.post(`/assign/${trainerId}/assign-program`, { traineeId, programId });
}
