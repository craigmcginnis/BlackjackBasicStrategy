import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService } from '../../core/services/ad.service';

@Component({
    selector: 'app-ad-display',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ad-display.component.html',
    styleUrls: ['./ad-display.component.scss']
})
export class AdDisplayComponent implements AfterViewInit {
    @Input() adSlot: string = '5096598407'; // Default slot
    @ViewChild('adContainer') adContainer!: ElementRef;

    constructor(private adService: AdService) { }

    ngAfterViewInit(): void {
        // Initialize ads and display in container when view is ready
        this.adService.initAds();
        if (this.adContainer?.nativeElement) {
            this.adService.displayAd(this.adSlot, this.adContainer.nativeElement);
        }
    }
}