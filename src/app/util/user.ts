export class User {
    private userName: string;
    private id: string;
    constructor(userName: string, id: string) {
        this.userName = userName;
        this.id = id;
    }

    getUserName(): string {
        return this.userName;
    }

    getId(): string {
        return this.userName;
    }
}