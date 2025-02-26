export interface UpdateCommandAttributes {
    /**
     * Tags you can add to changesets to determine which changesets in the changelog to evaluate based on their labels
     */
    labels?: string;
    /**
     * Expressions you can add to changesets to determine which changesets in the changelog to evaluate based on their contexts
     */
    url: string;
    /**
     * Specifies in what Schema the Liquibase DATABASECHANGELOG and DATABASECHANGELOGLOCK tables will be managed
     */
    username: string;
    /**
     * For MSSQL only: Specifies in what Catalog the Liquibase DATABASECHANGELOG and DATABASECHANGELOGLOCK tables will be managed
     */
    password: string;
}
