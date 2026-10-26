import { ChangeDetectionStrategy, Component, NO_ERRORS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NativeScriptCommonModule, RouterExtensions } from '@nativescript/angular';
import { Person } from './person';
import { PersonService } from './person.service';

@Component({
  selector: 'ns-person-detail',
  templateUrl: './person-detail.component.html',
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonDetailComponent implements OnInit {
  personService = inject(PersonService);
routerExtensions = inject(RouterExtensions);
  route = inject(ActivatedRoute);
  person = signal<Person>(null);
  isAndroid = __ANDROID__;

  ngOnInit(): void {
    const id = +this.route.snapshot.params.id;
    this.person.set(this.personService.getPerson(id));

    // log the person to the console
    console.log(this.person());
  }


  goBack() {
    this.routerExtensions.back();
  }

  formatAchievements(achievements: string[] | undefined | null): string {
    if (!achievements || !Array.isArray(achievements)) return '';
    return achievements.map( (a, index) =>  (index + 1) + '. ' + a.trim()).join('\n');
  }

}
