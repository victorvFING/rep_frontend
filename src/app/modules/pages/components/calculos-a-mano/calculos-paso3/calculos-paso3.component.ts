import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import AdultPAL from 'src/app/interfaces/AdultPALDTO';
import { ShowOnDirtyOrTouchedErrorStateMatcher } from 'src/app/modules/shared/dirty-or-touched-error-state-matcher';
import { groupSuman100Validator } from 'src/app/modules/shared/validators/group-suman-100.directive';
import { NumberForForms, numeroFloatValidator } from 'src/app/modules/shared/validators/numbers-validation';
import { step3RuralSuman100Validator } from 'src/app/modules/shared/validators/step3-rural-suman-100.directive';
import { step3UrbanSuman100Validator } from 'src/app/modules/shared/validators/step3-urban-suman-100.directive';

const percentageValidators: ValidatorFn[] = [
  numeroFloatValidator,
  Validators.min(0),
  Validators.max(100)];

@Component({
  selector: 'app-calculos-paso3',
  templateUrl: './calculos-paso3.component.html',
  styleUrls: ['./calculos-paso3.component.css'],
})
export class CalculosPaso3Component {

  constructor() {}

  matcher = new ShowOnDirtyOrTouchedErrorStateMatcher();

  adultPALForm = new FormGroup({
    population: new FormGroup({
      ruralPercentage: new FormControl('', percentageValidators),
      urbanPercentage: new FormControl('', percentageValidators)
    }, {validators: groupSuman100Validator(2)}),
    ruralPAL: new FormGroup({
      activeRuralPAL: new FormControl('', percentageValidators),
      lowRuralPAL: new FormControl('', percentageValidators)
    }),
    urbanPAL: new FormGroup({
      activeUrbanPAL: new FormControl('', percentageValidators),
      lowUrbanPAL: new FormControl('', percentageValidators)
    })}, { validators: Validators.compose([step3RuralSuman100Validator, step3UrbanSuman100Validator])
  });

  sendData(): AdultPAL {
    const ruralPercentage: number = NumberForForms(this.adultPALForm.get('population.ruralPercentage')?.value);
    const urbanPercentage: number = NumberForForms(this.adultPALForm.get('population.urbanPercentage')?.value);
    
    let activeRuralPAL: number = 100;
    let lowRuralPAL: number = 0;
    if (ruralPercentage !== 0) {
      activeRuralPAL = NumberForForms(this.adultPALForm.get('ruralPAL.activeRuralPAL')?.value);
      lowRuralPAL = NumberForForms(this.adultPALForm.get('ruralPAL.lowRuralPAL')?.value);
    }

    let activeUrbanPAL: number = 0;
    let lowUrbanPAL: number = 100;
    if (urbanPercentage !== 0) {
      activeUrbanPAL = NumberForForms(this.adultPALForm.get('urbanPAL.activeUrbanPAL')?.value);
      lowUrbanPAL = NumberForForms(this.adultPALForm.get('urbanPAL.lowUrbanPAL')?.value);
    }

    const adultPALData: AdultPAL = {urbanPercentage: urbanPercentage,
      activeUrbanPAL: activeUrbanPAL,
      lowUrbanPAL: lowUrbanPAL,
      ruralPercentage: ruralPercentage,
      activeRuralPAL: activeRuralPAL,
      lowRuralPAL: lowRuralPAL}
  
    return adultPALData
  }
}
