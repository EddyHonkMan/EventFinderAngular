import {
  AfterContentInit, AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  DoCheck,
  AfterContentChecked,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {text} from "express";

@Component({
  selector: 'app-expandable-text',
  templateUrl: './expandable-text.component.html',
  styleUrls: ['./expandable-text.component.css']
})

export class ExpandableTextComponent implements DoCheck{
  @Input() text?: string;
  @Input() lines: number = 2;
  @ViewChild('textContainer') textContainer!: ElementRef;
  isExpanded: boolean = false;
  textOverflowing: boolean = false;
  decisionMade: boolean = false;

  ngDoCheck() {
    if (!this.decisionMade && this.textContainer) {
      const nativeElement = this.textContainer.nativeElement;
      if (nativeElement.scrollHeight === 0 && nativeElement.clientHeight === 0) {
        return;
      }

      this.textOverflowing = (nativeElement.scrollHeight > nativeElement.clientHeight);
      // console.log('scrollHeight: ', nativeElement.scrollHeight)
      // console.log('clientHeight: ', nativeElement.clientHeight)
      this.decisionMade = true;
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
