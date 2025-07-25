// src/services/StudentService.ts
import { apiService } from './ApiService';

export interface StudentProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone?: string;
    profilePicture?: string;
    subscriptionPlan?: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    profile?: {
        age?: number;
        height?: number;
        weight?: number;
        lastWeightUpdate?: string;
        level: string;
        levelLabel: string;
        strengths: string[];
        weaknesses: string[];
        notes?: string;
        tacticalNotes?: string;
        lastTacticalNotesUpdate?: string;
        pendingNotes: Array<{
            note: string;
            created_at: string;
        }>;
        bmi?: number;
    };
}

export interface StudentFilters {
    level?: string;
    minAge?: number;
    maxAge?: number;
    search?: string;
    sortBy?: 'name' | 'level' | 'age' | 'updated';
    sortDirection?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
}

export interface StudentStatistics {
    totalStudents: number;
    activeStudents: number;
    byLevel: Record<string, number>;
    byAgeGroup: Record<string, number>;
    averageAge: number;
    withProfiles: number;
    pendingNotesCount: number;
}

class StudentService {

    async getAllStudents(filters?: StudentFilters): Promise<{ students: StudentProfile[]; pagination: any }> {
        try {
            const response = await apiService.getStudents({
                level: filters?.level,
                min_age: filters?.minAge,
                max_age: filters?.maxAge,
                search: filters?.search,
                sort_by: filters?.sortBy,
                sort_direction: filters?.sortDirection,
                page: filters?.page,
                per_page: filters?.perPage,
            });

            return {
                students: response.data,
                pagination: response.pagination,
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch students');
        }
    }

    async getStudent(id: string): Promise<StudentProfile> {
        try {
            const response = await apiService.getStudent(id);
            return response.student;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch student');
        }
    }

    async updateStudentProfile(id: string, profileData: {
        age?: number;
        height?: number;
        weight?: number;
        level?: string;
        strengths?: string[];
        weaknesses?: string[];
        notes?: string;
    }): Promise<StudentProfile> {
        try {
            const response = await apiService.updateStudentProfile(id, profileData);
            return response.student;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update student profile');
        }
    }

    async updateWeight(id: string, weight: number): Promise<StudentProfile> {
        try {
            const response = await apiService.updateStudentWeight(id, weight);
            return response.student;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update weight');
        }
    }

    async updateTacticalNotes(id: string, tacticalNotes: string): Promise<StudentProfile> {
        try {
            const response = await apiService.updateStudentTacticalNotes(id, tacticalNotes);
            return response.student;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update tactical notes');
        }
    }

    async addPendingNote(id: string, note: string): Promise<StudentProfile> {
        try {
            const response = await apiService.addStudentPendingNote(id, note);
            return response.student;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to add pending note');
        }
    }

    async removePendingNote(id: string, noteIndex: number): Promise<StudentProfile> {
        try {
            const response = await apiService.removeStudentPendingNote(id, noteIndex);
            return response.student;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to remove pending note');
        }
    }

    async getStatistics(): Promise<StudentStatistics> {
        try {
            const stats = await apiService.getStudentStatistics();
            return {
                totalStudents: stats.total_students,
                activeStudents: stats.active_students,
                byLevel: stats.by_level,
                byAgeGroup: stats.by_age_group,
                averageAge: stats.average_age,
                withProfiles: stats.with_profiles,
                pendingNotesCount: stats.pending_notes_count,
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch student statistics');
        }
    }

    // Helper methods for mapping data formats
    mapToLegacyFormat(student: StudentProfile): any {
        return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            age: student.profile?.age || 0,
            height: student.profile?.height || 0,
            weight: student.profile?.weight || 0,
            lastWeightUpdate: student.profile?.lastWeightUpdate ? new Date(student.profile.lastWeightUpdate) : new Date(),
            level: student.profile?.level || 'principiante',
            strengths: student.profile?.strengths || [],
            weaknesses: student.profile?.weaknesses || [],
            notes: student.profile?.notes || '',
            tacticalNotes: student.profile?.tacticalNotes || '',
            lastTacticalNotesUpdate: student.profile?.lastTacticalNotesUpdate ? new Date(student.profile.lastTacticalNotesUpdate) : new Date(),
            pendingNotes: student.profile?.pendingNotes || [],
            createdAt: new Date(student.createdAt),
            updatedAt: new Date(student.updatedAt),
        };
    }

    mapFromLegacyFormat(legacyStudent: any): Partial<StudentProfile> {
        return {
            firstName: legacyStudent.firstName,
            lastName: legacyStudent.lastName,
            profile: {
                age: legacyStudent.age,
                height: legacyStudent.height,
                weight: legacyStudent.weight,
                level: legacyStudent.level,
                strengths: legacyStudent.strengths || [],
                weaknesses: legacyStudent.weaknesses || [],
                notes: legacyStudent.notes,
                tacticalNotes: legacyStudent.tacticalNotes,
                pendingNotes: legacyStudent.pendingNotes || [],
                levelLabel: this.getLevelLabel(legacyStudent.level),
                bmi: this.calculateBMI(legacyStudent.height, legacyStudent.weight),
            },
        };
    }

    private getLevelLabel(level: string): string {
        const labels: Record<string, string> = {
            'principiante': 'Principiante',
            'intermedio': 'Intermedio',
            'avanzado': 'Avanzado',
            'competidor': 'Competidor',
            'elite': 'Élite',
        };
        return labels[level] || level;
    }

    private calculateBMI(height?: number, weight?: number): number | undefined {
        if (!height || !weight || height <= 0 || weight <= 0) return undefined;
        const heightInMeters = height / 100;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
    }
}

export const studentService = new StudentService();