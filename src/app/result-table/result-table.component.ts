import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableItem} from "../TableItem";

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.css']
})
export class ResultTableComponent {
  @Input() table?: TableItem[]
  @Output() entrySelectEvent = new EventEmitter<TableItem>()
  onSelect(item:TableItem) {
    this.entrySelectEvent.emit(item)
  }
}
