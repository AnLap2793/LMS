/**
 * Query Keys tập trung cho TanStack Query
 * Xem TEMPLATE_GUIDE.md để biết hướng dẫn chi tiết
 */
export const queryKeys = {
  /**
   * VÍ DỤ: User query keys
   */
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters) => [...queryKeys.users.lists(), { filters }],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
  },
};

