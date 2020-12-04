import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { LoginComponent } from './login/login.component';
import { ChatLogComponent } from './chat-log/chat-log.component';
import { ChatRoomsComponent } from './chat-rooms/chat-rooms.component';
import { StateDisplayComponent } from './dev/state-display/state-display.component';

let componentDeclarations: Array<any> = [
	AppComponent,
	ChatMessageComponent,
	LoginComponent,
	ChatLogComponent,
	ChatRoomsComponent,
	StateDisplayComponent
];
// if (isDevMode()) componentDeclarations.push(StateDisplayComponent);

@NgModule({
	declarations: [ ...componentDeclarations ],
	imports: [ BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule ],
	providers: [],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
