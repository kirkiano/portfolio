/*
 * Angular component implementing the "Contents" feature of the RPG web client,
 * ie, shows what things are in the present room. (Now superseded by the React
 * client.)
 */

import {Component, OnInit} from '@angular/core';
import Thing from '../models/world/thing';
import {WSSubject} from '../services/ws';
import {DescribeThing, WhatIsHere} from '../models/request';
import {ThingID} from '../common/types';


@Component({
  selector: 'app-contents',
  template: `
      <h4 class='title'>CONTENTS&nbsp;<span
              class='item-count'>(&thinsp;&thinsp;{{contentList.length}}&thinsp;&thinsp;)
      </span>
      </h4>
      <ul>
          <li *ngFor='let thing of contentList'
              (click)='requestDescription(thing.id)'
              matTooltip="Click for description"
              matTooltipShowDelay='0'
              matTooltipPosition='above'>
              {{thing.name}}
          </li>
      </ul>`,
})
export class ContentsComponent implements OnInit {
  private myID: ThingID;
  public contents: {[id: number]: Thing} = {};
  public contentList: Array<Thing> = [];

  constructor(private ws: WSSubject) {
    this.sortContents = this.sortContents.bind(this);
    this.refreshContents = this.refreshContents.bind(this);
    this.addToContents = this.addToContents.bind(this);
    this.removeFromContents = this.removeFromContents.bind(this);
    this.requestDescription = this.requestDescription.bind(this);
  }

  ngOnInit() {
    this.ws.welcome().subscribe(myID => this.myID = myID);
    this.ws.iMoved().subscribe(() => this.ws.send(new WhatIsHere()));
    this.ws.contents().subscribe(this.refreshContents);
    this.ws.joined().subscribe(this.addToContents);
    this.ws.entered().subscribe(m => this.addToContents(m.thing));
    this.ws.exited().subscribe(m => this.removeFromContents(m.thing.id));
  }

  private addToContents(thing: Thing) {
    if (thing.id !== this.myID) {
      this.contents[thing.id] = thing;
    }
    this.sortContents();
  }

  private removeFromContents(tid: ThingID) {
    delete this.contents[tid];
    this.sortContents();
  }

  private refreshContents(things: [Thing]) {
    this.contents = {};
    for (const thing of things) {
      if (thing.id !== this.myID) {
        this.contents[thing.id] = thing;
      }
    }
    this.sortContents();
  }

  private sortContents() {
    this.contentList = Object.values(this.contents).sort(Thing.compareByName);
  }

  private requestDescription(thingID) {
    this.ws.send(new DescribeThing(thingID));
  }

}
