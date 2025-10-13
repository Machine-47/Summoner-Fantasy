import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
selector: 'app-search-bar',
standalone: true,
template: `
<div class="flex gap-3 items-center">
<input class="input" type="text" [placeholder]="placeholder" [value]="value" (input)="onInput($event)">
<ng-content />
</div>
`
})
export class SearchBarComponent {
@Input() placeholder = 'Buscar…';
@Input() value = '';
@Output() valueChange = new EventEmitter<string>();
onInput(e: Event){
const v = (e.target as HTMLInputElement).value;
this.valueChange.emit(v);
}
}