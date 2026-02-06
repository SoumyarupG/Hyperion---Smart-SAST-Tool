import { Directive, EventEmitter, Input, Output } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | '';

export interface listSortEvent {
  column: string;         // 🛑 No custom type. Only 'string'
  direction: SortDirection;
}

const rotate: { [key: string]: SortDirection } = { 
  'asc': 'desc',
  'desc': '',
  '': 'asc'
};

@Directive({
  selector: 'th[listsortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdListSortableHeader {
  @Input() listsortable: string = '';  // 🛑 No custom type. Only 'string'
  @Input() direction: SortDirection = '';
  @Output() listsort = new EventEmitter<listSortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.listsort.emit({ column: this.listsortable, direction: this.direction });
  }
}
