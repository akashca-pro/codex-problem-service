import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

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
        return this._model.findById(documentId);
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
     * Finds all documents that match the query.
     * @param filter - The filter query.
     * @returns An array of found documents.
     */
    async find(filter : FilterQuery<T>) : Promise<T[]> {
        return this._model.find(filter)
    }

    /**
     * Updates a document by its ID.
     * @param documentId - The ID of the document to update.
     * @param update - The update query.
     */
    async update(documentId : string, update : UpdateQuery<T>) : Promise<void> {
        await this._model.findByIdAndUpdate(documentId, update, { new : true });
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
     * Deletes a document by its ID.
     * @param documentId - The ID of the document to delete.
     * @returns The deleted document or null.
     */
    async delete(documentId: string): Promise<T | null> {
        return this._model.findByIdAndDelete(documentId).exec();
    }

}