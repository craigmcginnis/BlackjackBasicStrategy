import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleSet } from '../../core/models/blackjack.models';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  rules: RuleSet = { id: 'default', name: '6D', decks: 6, hitSoft17: false, doubleAfterSplit: true, lateSurrender: false };
  private saveTimer: any;
  presets: RuleSet[] = [
    { id:'vegas-6d-s17', name:'Vegas 6D S17 DAS', decks:6, hitSoft17:false, doubleAfterSplit:true, lateSurrender:false },
    { id:'vegas-6d-h17', name:'Vegas 6D H17 DAS', decks:6, hitSoft17:true, doubleAfterSplit:true, lateSurrender:false },
    { id:'atlantic-6d-h17-ls', name:'Atlantic 6D H17 DAS LS', decks:6, hitSoft17:true, doubleAfterSplit:true, lateSurrender:true },
    { id:'single-deck-h17', name:'Single Deck H17 No DAS', decks:1, hitSoft17:true, doubleAfterSplit:false, lateSurrender:false },
  ];
  constructor(private storage: StorageService){
    const saved = this.storage.loadRuleSet();
    if(saved) this.rules = saved;
  }
  applyPreset(ev: Event){
    const id = (ev.target as HTMLSelectElement).value;
    const preset = this.presets.find(p=>p.id===id);
    if(!preset) return;
    this.rules = { ...preset };
    this.queueSave();
    window.dispatchEvent(new CustomEvent('rules-changed'));
  }
  changeDecks(ev: Event){
    const v = parseInt((ev.target as HTMLSelectElement).value,10);
    this.rules.decks = v;
    this.queueSave();
    window.dispatchEvent(new CustomEvent('rules-changed'));
  }
  private queueSave(){
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(()=> this.storage.saveRuleSet({...this.rules}), 150);
    window.dispatchEvent(new CustomEvent('rules-changed'));
  }
  set<K extends keyof RuleSet>(key: K, ev: Event){
    const checked = (ev.target as HTMLInputElement).checked as any;
    (this.rules as any)[key] = checked;
    this.queueSave();
  }
}
