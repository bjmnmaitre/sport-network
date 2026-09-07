import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';

/**
 * Generic base repository for all entities
 * Provides standard CRUD operations and common query patterns
 */
export abstract class BaseRepository<Entity extends ObjectLiteral> {
  constructor(protected repository: Repository<Entity>) {}

  /**
   * Find entity by id
   */
  async findById(id: string): Promise<Entity | null> {
    return this.repository.findOne({ where: { id } as unknown as FindOptionsWhere<Entity> });
  }

  /**
   * Find all entities matching criteria
   */
  async find(where: FindOptionsWhere<Entity>): Promise<Entity[]> {
    return this.repository.find({ where });
  }

  /**
   * Find one entity matching criteria
   */
  async findOne(where: FindOptionsWhere<Entity>): Promise<Entity | null> {
    return this.repository.findOne({ where });
  }

  /**
   * Save entity (create or update)
   */
  async save(entity: Entity): Promise<Entity> {
    return this.repository.save(entity);
  }

  /**
   * Save multiple entities
   */
  async saveMany(entities: Entity[]): Promise<Entity[]> {
    return this.repository.save(entities);
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count entities matching criteria
   */
  async count(where?: FindOptionsWhere<Entity>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Check if entity exists
   */
  async exists(where: FindOptionsWhere<Entity>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }
}