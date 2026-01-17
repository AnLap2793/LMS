
import { useQuery } from '@tanstack/react-query';
import { departmentService } from '../services/departmentService';
import { COLLECTIONS } from '../constants/collections';

export const useDepartments = () => {
    return useQuery({
        queryKey: [COLLECTIONS.DEPARTMENTS, 'list'],
        queryFn: () => departmentService.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
