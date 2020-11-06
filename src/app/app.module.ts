import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { LoginComponent } from './login/login.component';
import { ChatLogComponent } from './chat-log/chat-log.component';
import { ChatRoomsComponent } from './chat-rooms/chat-rooms.component';

@NgModule({
	declarations: [ AppComponent, ChatMessageComponent, LoginComponent, ChatLogComponent, ChatRoomsComponent ],
	imports: [ BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule ],
	providers: [],
	bootstrap: [ AppComponent ]
})
export class AppModule {}
