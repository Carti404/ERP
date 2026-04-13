import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackModalComponent } from './shared/components/feedback-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
