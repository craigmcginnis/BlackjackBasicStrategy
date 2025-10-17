import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { SEOService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private seoService: SEOService) { }

  ngOnInit(): void {
    this.seoService.updateMetadata({
      title: 'Blackjack Basic Strategy Trainer | Learn Optimal Blackjack Play',
      description: 'Master blackjack basic strategy with interactive drills, flashcards, and analytics. Improve your casino odds with our free strategy trainer.',
      url: ''
    });
    this.seoService.setCanonicalURL();
  }
}
