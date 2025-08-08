/**
 * Data Transfer Object (DTO) representing pagination information.
 *
 * @interface
 */
export interface PaginationDTO {
  /**
   * The body of the response, representing the paginated data.
   */
  body: unknown[]

  /**
   * The total number of pages.
   */
  totalPages: number

  /**
   * The current page number.
   */
  currentPage: number

  /**
   * The total items overall
   */
  totalItems: number
}
