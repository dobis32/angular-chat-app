import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { User } from '../util/user';

export class ChatRoom {
    private _name: string;
    private _users: Array<User>;
    private _capacity: number;
    private _password;

    constructor(name: string, capacity: number, users?: Array<User>, password?: string) {
        this._name = name;
        this._capacity = capacity;
        this._users = users ? users : new Array();
        this._password = password ? password : '';        
    }

    isPrivate(): boolean {
        return this._password.length ? true : false;
    }

    getName(): string {
        return this._name;
    }

    getUsers(): Array<User> {
        return this._users;
    }

    getCapacity(): number {
        return this._capacity;
    }

    getPassword(): string {
        return this._password;
    }
}