/**
 * Document Service - Quản lý thư viện tài liệu tập trung
 * Hỗ trợ cả file upload và URL bên ngoài
 */
import { directus, getAssetUrl } from './directus';
import { readItems, createItem, updateItem, deleteItem, uploadFiles, readItem } from '@directus/sdk';
import { COLLECTIONS } from '../constants/collections';

/**
 * Transform document để thêm các computed fields
 */
const transformDocument = doc => {
    if (!doc) return null;
    return {
        ...doc,
        // Thêm URL đầy đủ cho file nếu có
        fileUrl: doc.file ? getAssetUrl(doc.file) : null,
        // Display title: ưu tiên title, fallback về file name
        displayTitle: doc.title || doc.file?.filename_download || 'Untitled',
    };
};

export const documentService = {
    /**
     * Lấy tất cả documents với filter và pagination
     */
    getAll: async (params = {}) => {
        const documents = await directus.request(
            readItems(COLLECTIONS.DOCUMENTS, {
                fields: ['*', 'file.*', 'user_created.id', 'user_created.first_name', 'user_created.last_name'],
                sort: ['-date_created'],
                ...params,
            })
        );
        return documents.map(transformDocument);
    },

    /**
     * Lấy documents đang active (không bị archived)
     */
    getActive: async (params = {}) => {
        return documentService.getAll({
            filter: { status: { _eq: 'active' } },
            ...params,
        });
    },

    /**
     * Lấy document theo ID
     */
    getById: async (id, params = {}) => {
        const result = await directus.request(
            readItems(COLLECTIONS.DOCUMENTS, {
                fields: ['*', 'file.*', 'user_created.id', 'user_created.first_name', 'user_created.last_name'],
                filter: { id: { _eq: id } },
                limit: 1,
                ...params,
            })
        );
        return result[0] ? transformDocument(result[0]) : null;
    },

    /**
     * Tìm kiếm documents theo title hoặc tags
     */
    search: async (query, params = {}) => {
        return documentService.getAll({
            filter: {
                _or: [{ title: { _icontains: query } }, { tags: { _contains: query } }],
                status: { _eq: 'active' },
            },
            ...params,
        });
    },

    /**
     * Tạo document mới (file hoặc URL)
     */
    create: async data => {
        return await directus.request(createItem(COLLECTIONS.DOCUMENTS, data));
    },

    /**
     * Upload file và tạo document
     */
    uploadAndCreate: async (file, metadata = {}) => {
        // Upload file to Directus
        const formData = new FormData();
        formData.append('file', file);

        const uploadedFile = await directus.request(uploadFiles(formData));

        // Create document với reference tới file đã upload
        const documentData = {
            type: 'file',
            title: metadata.title || file.name,
            description: metadata.description || null,
            tags: metadata.tags || null,
            file: uploadedFile.id,
            status: 'active',
        };

        return await documentService.create(documentData);
    },

    /**
     * Tạo document dạng URL
     */
    createUrl: async (url, metadata = {}) => {
        const documentData = {
            type: 'url',
            title: metadata.title || url,
            description: metadata.description || null,
            tags: metadata.tags || null,
            url: url,
            url_type: metadata.url_type || 'external',
            status: 'active',
        };

        return await documentService.create(documentData);
    },

    /**
     * Cập nhật document
     */
    update: async (id, data) => {
        return await directus.request(updateItem(COLLECTIONS.DOCUMENTS, id, data));
    },

    /**
     * Archive document (soft delete)
     */
    archive: async id => {
        return documentService.update(id, { status: 'archived' });
    },

    /**
     * Archive nhiều documents cùng lúc
     */
    archiveMany: async ids => {
        const promises = ids.map(id => documentService.archive(id));
        return await Promise.all(promises);
    },

    /**
     * Restore document từ archived
     */
    restore: async id => {
        return documentService.update(id, { status: 'active' });
    },

    /**
     * Xóa document vĩnh viễn (hard delete)
     */
    delete: async id => {
        // Xóa các junction records trước
        const junctionRecords = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                filter: { documents_id: { _eq: id } },
            })
        );

        for (const record of junctionRecords) {
            await directus.request(deleteItem(COLLECTIONS.LESSONS_DOCUMENTS, record.id));
        }

        // Xóa document
        return await directus.request(deleteItem(COLLECTIONS.DOCUMENTS, id));
    },

    /**
     * Lấy danh sách bài học đang sử dụng document
     */
    getUsageLessons: async documentId => {
        const junctionRecords = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                fields: ['lessons_id.*', 'lessons_id.module_id.title', 'lessons_id.module_id.course_id.title'],
                filter: { documents_id: { _eq: documentId } },
            })
        );

        return junctionRecords.map(record => ({
            lesson: record.lessons_id,
            module: record.lessons_id?.module_id,
            course: record.lessons_id?.module_id?.course_id,
        }));
    },

    /**
     * Đếm số bài học đang sử dụng document
     */
    countUsage: async documentId => {
        const junctionRecords = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                filter: { documents_id: { _eq: documentId } },
                aggregate: { count: '*' },
            })
        );
        return junctionRecords[0]?.count || 0;
    },

    // ==================== Junction Table Methods ====================

    /**
     * Lấy documents của một lesson
     */
    getByLesson: async (lessonId, params = {}) => {
        const junctionRecords = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                fields: ['*', 'documents_id.*', 'documents_id.file.*'],
                filter: { lessons_id: { _eq: lessonId } },
                sort: ['sort'],
                ...params,
            })
        );

        return junctionRecords.map(record => ({
            junctionId: record.id,
            sort: record.sort,
            ...transformDocument(record.documents_id),
        }));
    },

    /**
     * Thêm document vào lesson
     */
    addToLesson: async (lessonId, documentId, sort = 0) => {
        // Check if already exists
        const existing = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                filter: {
                    lessons_id: { _eq: lessonId },
                    documents_id: { _eq: documentId },
                },
                limit: 1,
            })
        );

        if (existing.length > 0) {
            throw new Error('Document already attached to this lesson');
        }

        return await directus.request(
            createItem(COLLECTIONS.LESSONS_DOCUMENTS, {
                lessons_id: lessonId,
                documents_id: documentId,
                sort: sort,
            })
        );
    },

    /**
     * Xóa document khỏi lesson
     */
    removeFromLesson: async (lessonId, documentId) => {
        const junctionRecords = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                filter: {
                    lessons_id: { _eq: lessonId },
                    documents_id: { _eq: documentId },
                },
            })
        );

        if (junctionRecords.length > 0) {
            return await directus.request(deleteItem(COLLECTIONS.LESSONS_DOCUMENTS, junctionRecords[0].id));
        }
    },

    /**
     * Cập nhật thứ tự documents trong lesson
     */
    updateLessonDocumentsOrder: async (lessonId, orderedDocumentIds) => {
        const promises = orderedDocumentIds.map((documentId, index) =>
            directus
                .request(
                    readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                        filter: {
                            lessons_id: { _eq: lessonId },
                            documents_id: { _eq: documentId },
                        },
                    })
                )
                .then(records => {
                    if (records.length > 0) {
                        return directus.request(
                            updateItem(COLLECTIONS.LESSONS_DOCUMENTS, records[0].id, { sort: index })
                        );
                    }
                })
        );

        return await Promise.all(promises);
    },

    /**
     * Đồng bộ danh sách documents cho lesson
     * (Xóa những cái không có trong list, thêm những cái mới)
     */
    syncLessonDocuments: async (lessonId, documentIds) => {
        // Lấy danh sách hiện tại
        const currentRecords = await directus.request(
            readItems(COLLECTIONS.LESSONS_DOCUMENTS, {
                filter: { lessons_id: { _eq: lessonId } },
            })
        );

        const currentIds = currentRecords.map(r => r.documents_id);

        // Xóa những cái không còn trong list
        const toRemove = currentRecords.filter(r => !documentIds.includes(r.documents_id));
        for (const record of toRemove) {
            await directus.request(deleteItem(COLLECTIONS.LESSONS_DOCUMENTS, record.id));
        }

        // Thêm những cái mới
        const toAdd = documentIds.filter(id => !currentIds.includes(id));
        for (let i = 0; i < toAdd.length; i++) {
            await directus.request(
                createItem(COLLECTIONS.LESSONS_DOCUMENTS, {
                    lessons_id: lessonId,
                    documents_id: toAdd[i],
                    sort: currentRecords.length + i,
                })
            );
        }

        // Cập nhật thứ tự
        await documentService.updateLessonDocumentsOrder(lessonId, documentIds);
    },
};
