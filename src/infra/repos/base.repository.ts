import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

/**
 * Abstract base class for a generic repository.
 * Provides common CRUD operations for a Mongoose model.
 *
 * @template T - The type of the Mongoose document.
 */
export abstract class BaseRepository <T extends Document> {

    #_model : Model<T>;

    constructor(model : Model<T>){
        this.#_model = model;
    }

    /**
     * Creates a new document.
     * @param data - The data for the new document.
     * @returns The created document.
     */
    async create(data : Partial<T>) : Promise<T> {
        return this.#_model.create(data);
    }

    /**
     * Finds a document by its ID.
     * @param id - The ID of the document.
     * @returns The found document or null.
     */
    async findById(id : string) : Promise<T | null> {
        return this.#_model.findById(id);
    }
    
    /**
     * Finds a single document that matches the query.
     * @param filter - The filter query.
     * @returns The found document or null.
     */
    async findOne(filter : FilterQuery<T>) : Promise<T | null> {
        return this.#_model.findOne(filter);
    }

    /**
     * Finds all documents that match the query.
     * @param filter - The filter query.
     * @returns An array of found documents.
     */
    async find(filter : FilterQuery<T>) : Promise<T[]> {
        return this.#_model.find(filter)
    }

    /**
     * Updates a document by its ID.
     * @param id - The ID of the document to update.
     * @param update - The update query.
     * @returns The updated document or null.
     */
    async update(id : string, update : UpdateQuery<T>) : Promise<T | null> {
        return this.#_model.findByIdAndUpdate(id, update, { new : true });
    }

    /**
     * Deletes a document by its ID.
     * @param id - The ID of the document to delete.
     * @returns The deleted document or null.
     */
    async delete(id: string): Promise<T | null> {
        return this.#_model.findByIdAndDelete(id).exec();
    }

}