import { Model, Document, FilterQuery, UpdateQuery, LeanDocument } from 'mongoose';
import { IProblem } from '../db/interface/problem.interface';

/**
 * Abstract base class for a generic repository.
 * Provides common CRUD operations for a Mongoose model.
 *
 * @template T - The type of the Mongoose document.
 */
export abstract class BaseRepository <T extends Document> {

    protected _model : Model<T>;

    constructor(model : Model<T>){
        this._model = model;
    }

    /**
     * Creates a new document.
     * @param data - The data for the new document.
     * @returns The created document.
     */
    async create(data : Partial<T>) : Promise<T> {
        return this._model.create(data);
    }

    /**
     * Finds a document by its ID.
     * @param documentId - The ID of the document.
     * @returns The found document or null.
     */
    async findById(documentId : string) : Promise<T | null> {
        return this._model.findById(documentId)
    }

    /**
     * Finds a document by its ID and returns it as a plain object (lean).
     * @param documentId - The ID of the document.
     * @returns The found lean document or null.
     */
    async findByIdLean(documentId: string): Promise<LeanDocument<T> | null> {
        return this._model.findById(documentId).lean();
    }
    
    /**
     * Finds a single document that matches the query.
     * @param filter - The filter query.
     * @returns The found document or null.
     */
    async findOne(filter : FilterQuery<T>) : Promise<T | null> {
        return this._model.findOne(filter);
    }

    /**
     * Finds a single document matching the filter and returns it as a plain object (lean).
     * @param filter - The MongoDB filter query.
     * @returns The found lean document or null.
     */
    async findOneLean(filter: FilterQuery<T>): Promise<LeanDocument<T> | null> {
        return this._model.findOne(filter).lean();
    }

    /**
     * Finds all documents that match the query.
     * @param filter - The filter query.
     * @returns An array of found documents.
     */
    async find(filter : FilterQuery<T>) : Promise<T[]> {
        return this._model.find(filter)
    }

    /**
     * Finds all documents matching the filter and returns them as plain objects (lean).
     * @param filter - The MongoDB filter query.
     * @returns An array of lean documents.
     */
    async findLean(filter: FilterQuery<T>): Promise<LeanDocument<T>[]> {
        return this._model.find(filter).lean();
    }

    /**
     * Retrieves a paginated list of documents that match the given filter.
     *
     * @param filter - The MongoDB filter query to match documents.
     * @param skip - The number of documents to skip (used for pagination).
     * @param limit - The maximum number of documents to return.
     * @param sort - The sort order for the result set (default: descending by createdAt).
     * @returns A promise that resolves to an array of documents matching the criteria.
     */
    async findPaginated(
        filter : FilterQuery<T>,
        skip : number,
        limit : number,
        sort : Record<string, 1 | -1 > = { createdAt : -1 }
    ) : Promise<T[]> {
        return this._model.find(filter).skip(skip).limit(limit).sort(sort).exec();
    }

    /**
     * Retrieves paginated documents as plain objects (lean).
     * @param filter - The MongoDB filter query.
     * @param skip - Number of documents to skip (pagination).
     * @param limit - Max number of documents to return.
     * @param sort - Sort order for results (default: descending by createdAt).
     * @returns An array of lean documents.
     */
    async findPaginatedLean(
        filter: FilterQuery<T>,
        skip: number,
        limit: number,
        sort: Record<string, 1 | -1> = { createdAt: -1 }
    ): Promise<LeanDocument<T>[]> {
        return this._model.find(filter).skip(skip).limit(limit).sort(sort).lean();
    }

    /**
     * Updates a document by its ID.
     * @param documentId - The ID of the document to update.
     * @param update - The update query.
     */
    async update(documentId : string, update : UpdateQuery<T>) : Promise<IProblem | null> {
        return await this._model.findByIdAndUpdate(documentId, update, { new : true });
    }

    /**
     * Updates object that inside an array which itself is an object (field in the db) .
     * @param documentId - The ID of the document to update.
     * @param arrayName - The field name which itself an array of objects.
     * @param itemId - The _id if the item inside the array.
     * @param updatedFields - The object contains updated fields
     */
    async updateEmbeddedArrayItems(
        documentId : string,
        arrayName : string,
        itemId : string,
        updatedFields : Record<string,any>
    ) : Promise<void> {

        const updateQuery : Record<string,any> = {};

        for(const [key, value] of Object.entries(updatedFields)){
            updateQuery[`${arrayName}.$.${key}`] = value;
        }

       await this._model.updateOne(
        {_id : documentId, [`${arrayName}._id`] : itemId },
        { $set : updateQuery }
       )
    }

    /**
     * 
     * @param filter - The filter query.
     * @returns The count of documents.
     */
    async countDocuments(filter : FilterQuery<T>) : Promise<number> {
        return await this._model.countDocuments(filter);
    }

    /**
     * Deletes a document by its ID.
     * @param documentId - The ID of the document to delete.
     * @returns The deleted document or null.
     */
    async delete(documentId: string): Promise<T | null> {
        return this._model.findByIdAndDelete(documentId).exec();
    }

}