import { Breakpoints } from "@angular/cdk/layout";
import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {MatPaginator} from '@angular/material/paginator';
import { MatSnackBar } from "@angular/material/snack-bar";
import {MatTableDataSource} from '@angular/material/table';
import { compareFranjaEtaria, FranjaEtaria } from "src/app/enums/FranjaEtaria";
import { Sexo } from "src/app/enums/Sexo";
import { GrupoEtario } from "src/app/models/grupo-etario";
import { NumberForForms, numeroEnteroPositivoValidator, numeroFloatMayorCeroValidator } from "src/app/modules/shared/validators/numbers-validation";


import { step1CantidadSinMedianaValidator } from "src/app/modules/shared/validators/step1-cantidad-sin-mediana.directive";
import { step1TodoVacioValidator } from "src/app/modules/shared/validators/step1-todo-vacio.directive";
import { ParsedDataService } from "src/app/services/parsed-data.service";
import { AgeGroupJSON } from "src/app/services/rest/rest.service";


const femeninoData: GrupoEtario[] = []
const masculinoData: GrupoEtario[] = []

@Component({
  selector: 'app-calculos-paso1',
  templateUrl: './calculos-paso1.component.html',
  styleUrls: ['./calculos-paso1.component.css']
})
export class CalculosPaso1Component implements AfterViewInit {

  stepperLogic = {
    agesMinorPresent: false,
    agesAdultPresent: false,
    agesFemale18To29Present: false,
    agesFemale30To59Present: false,
  }

  edades: FranjaEtaria[] = [
    FranjaEtaria.Meses_0,
    FranjaEtaria.Meses_1,
    FranjaEtaria.Meses_2,
    FranjaEtaria.Meses_3,
    FranjaEtaria.Meses_4,
    FranjaEtaria.Meses_5,
    FranjaEtaria.Meses_6,
    FranjaEtaria.Meses_7,
    FranjaEtaria.Meses_8,
    FranjaEtaria.Meses_9,
    FranjaEtaria.Meses_10,
    FranjaEtaria.Meses_11,
    FranjaEtaria.Anios_1,
    FranjaEtaria.Anios_2,
    FranjaEtaria.Anios_3,
    FranjaEtaria.Anios_4,
    FranjaEtaria.Anios_5,
    FranjaEtaria.Anios_6,
    FranjaEtaria.Anios_7,
    FranjaEtaria.Anios_8,
    FranjaEtaria.Anios_9,
    FranjaEtaria.Anios_10,
    FranjaEtaria.Anios_11,
    FranjaEtaria.Anios_12,
    FranjaEtaria.Anios_13,
    FranjaEtaria.Anios_14,
    FranjaEtaria.Anios_15,
    FranjaEtaria.Anios_16,
    FranjaEtaria.Anios_17,
    FranjaEtaria.Anios_18_29,
    FranjaEtaria.Anios_30_59,
    FranjaEtaria.Anios_60_mas
  ];

  constructor(private _snackBar: MatSnackBar, private parsedDataService : ParsedDataService) { }

  displayedColumns: string[] = ['edad', 'cantidad', 'mediana'];
  dataSourceF = new MatTableDataSource<GrupoEtario>(femeninoData);
  dataSourceM = new MatTableDataSource<GrupoEtario>(masculinoData);

  fromTemplate : boolean = false;

  @ViewChild('TablePaginatorF') paginatorF: MatPaginator;
  @ViewChild('TablePaginatorM') paginatorM: MatPaginator;

  ngOnInit() {
    if (this.parsedDataService.getData()?.length) {
      this.fromTemplate = true;
      this.initializeTable(this.parsedDataService.getData());
    }
  }

  ngAfterViewInit() {
    this.dataSourceF.paginator = this.paginatorF;
    this.dataSourceM.paginator = this.paginatorM;
  }

  grupoEtarioForm = new FormGroup({
    edad: new FormControl('', Validators.required),
    cantFemenino: new FormControl('', numeroEnteroPositivoValidator),
    cantMasculino: new FormControl('', numeroEnteroPositivoValidator),
    medianaFemenino: new FormControl('', numeroFloatMayorCeroValidator),
    medianaMasculino: new FormControl('', numeroFloatMayorCeroValidator)
  }, { validators: Validators.compose([step1TodoVacioValidator, step1CantidadSinMedianaValidator]) })
  
  onSubmit() {
    // Revisar si la la franja etaria ya tiene datos en la tabla
    let repetido: Boolean = false;
    const franja: string = this.grupoEtarioForm.get('edad')?.value;

    repetido = masculinoData.some((group: GrupoEtario)=> {
      return group.edad === franja;
    });
    if (!repetido) {
      repetido = femeninoData.some((group: GrupoEtario)=> {
        return group.edad === franja;
      });
    }
    if (repetido) {
      // presento mensaje de error
      this._snackBar.open(
        "ERROR: Ya existen datos ingresados para esta franja etaria", "Aceptar")
    } else {
      // Datos Femenino
      if (this.grupoEtarioForm.get('medianaFemenino')?.value != '') { // hay datos para agregar a Femenino
        let grupoFem : GrupoEtario = new GrupoEtario(
          this.grupoEtarioForm.get('edad')?.value,
          Sexo.Femenino,
          NumberForForms(this.grupoEtarioForm.get('medianaFemenino')?.value),
          NumberForForms(this.grupoEtarioForm.get('cantFemenino')?.value))
        this.addFem(grupoFem);
      }
      // Datos Masculino
      if (this.grupoEtarioForm.get('medianaMasculino')?.value != '') { // hay datos para agregar a Masculino
        let grupoMasc : GrupoEtario = new GrupoEtario(
          this.grupoEtarioForm.get('edad')?.value,
          Sexo.Masculino,
          NumberForForms(this.grupoEtarioForm.get('medianaMasculino')?.value),
          NumberForForms(this.grupoEtarioForm.get('cantMasculino')?.value))
        this.addMasc(grupoMasc);
      }
    }
  } // onSubmit

  addFem(grupo: GrupoEtario) {
    femeninoData.push(grupo);
    femeninoData.sort((a,b) => {
      return compareFranjaEtaria(a.edad, b.edad)
    })
    this.dataSourceF._updateChangeSubscription();
    this.updateStepperLogicOnInsert(grupo.edad, grupo.sexo);
  }

  addMasc(grupo: GrupoEtario) {
    masculinoData.push(grupo);
      masculinoData.sort((a,b) => {
        return compareFranjaEtaria(a.edad, b.edad)
      })
    this.dataSourceM._updateChangeSubscription();
    this.updateStepperLogicOnInsert(grupo.edad, grupo.sexo);
  }

  // Boton de borrar datos asociados a FranjaEtaria
  borrarEdad() {
    // la edad actualmente seleccionada en grupoEtarioForm
    const edadSel: FranjaEtaria = this.grupoEtarioForm.get('edad')?.value;
    
    // Borro en la tabla femeninoData
    const indexF = femeninoData.findIndex((element: GrupoEtario) => {
      return element.edad === edadSel;
    })
    if (indexF > -1) {
      femeninoData.splice(indexF, 1);
      this.dataSourceF._updateChangeSubscription(); // actualizo la tabla
      this.updateStepperLogicOnRemove(edadSel, Sexo.Femenino);
    }
    // Borro en la tabla femeninoData
    const indexM = masculinoData.findIndex((element: GrupoEtario) => {
      return element.edad === edadSel;
    })
    if (indexM > -1) {
      masculinoData.splice(indexM, 1);
      this.dataSourceM._updateChangeSubscription(); // actualizo la tabla
      this.updateStepperLogicOnRemove(edadSel, Sexo.Masculino);
    }
  } // borrarEdad

  // Envio de datos al backend
  prepareData(dataFem:GrupoEtario[], dataMasc :GrupoEtario[]): AgeGroupJSON[] {
    const res: AgeGroupJSON[] =[];
    
    dataFem.forEach((group: GrupoEtario)=> {
      let elem :AgeGroupJSON = {
        age: group.edad,
        sex: group.sexo,
        medianWeight: group.pesoMediano,
        population: group.cantidad };
      res.push(elem);
    });

    dataMasc.forEach((group: GrupoEtario)=> {
      let elem :AgeGroupJSON = {
        age: group.edad,
        sex: group.sexo,
        medianWeight: group.pesoMediano,
        population: group.cantidad };
      res.push(elem);
    });

    return res;
  }

  sendData(): AgeGroupJSON[] {
    return this.prepareData(femeninoData, masculinoData)
  }

  //Inicaliza la tabla de resultados
  initializeTable(grupos: GrupoEtario[]) {
    grupos.forEach( (grupo) => {
      switch (grupo.sexo) {
        case Sexo.Masculino:
          this.addMasc(grupo);
          break;
        case Sexo.Femenino:
          this.addFem(grupo);
          break;
      }
    });
  }

  updateStepperLogicOnInsert(age: FranjaEtaria, sex: Sexo) {
    if(compareFranjaEtaria(age, FranjaEtaria.Anios_6) >= 0 &&
      compareFranjaEtaria(age, FranjaEtaria.Anios_17) <= 0) {
        this.stepperLogic.agesMinorPresent = true;
    }
    else if (compareFranjaEtaria(age,FranjaEtaria.Anios_18_29) >= 0) {
      this.stepperLogic.agesAdultPresent = true;
      if (compareFranjaEtaria(age, FranjaEtaria.Anios_18_29) === 0 && sex === Sexo.Femenino) {
        this.stepperLogic.agesFemale18To29Present = true;
      }
      else if (compareFranjaEtaria(age, FranjaEtaria.Anios_30_59) === 0 && sex === Sexo.Femenino) {
        this.stepperLogic.agesFemale30To59Present = true;
      }
    }
  }

  updateStepperLogicOnRemove(age: FranjaEtaria, sex: Sexo) {
    if(compareFranjaEtaria(age, FranjaEtaria.Anios_6) >= 0 &&
      compareFranjaEtaria(age, FranjaEtaria.Anios_17) <= 0) {
      this.stepperLogic.agesMinorPresent =
        femeninoData.some((group: GrupoEtario) => {
          return compareFranjaEtaria(group.edad, FranjaEtaria.Anios_6) >= 0 &&
          compareFranjaEtaria(group.edad, FranjaEtaria.Anios_17) <= 0
        }) ||
        masculinoData.some((group: GrupoEtario) => {
          return compareFranjaEtaria(group.edad, FranjaEtaria.Anios_6) >= 0 &&
          compareFranjaEtaria(group.edad, FranjaEtaria.Anios_17) <= 0
        });
    }
    else if (compareFranjaEtaria(age, FranjaEtaria.Anios_18_29) >= 0) {
      if (compareFranjaEtaria(age, FranjaEtaria.Anios_18_29) === 0 && sex === Sexo.Femenino) {
        this.stepperLogic.agesFemale18To29Present = false;
      }
      else if (compareFranjaEtaria(age, FranjaEtaria.Anios_30_59) === 0 && sex === Sexo.Femenino) {
        this.stepperLogic.agesFemale30To59Present = false;
      }
      this.stepperLogic.agesAdultPresent =
        femeninoData.some((group: GrupoEtario) => {
          return compareFranjaEtaria(group.edad, FranjaEtaria.Anios_18_29) >= 0
        }) ||
        masculinoData.some((group: GrupoEtario) => {
          return compareFranjaEtaria(group.edad, FranjaEtaria.Anios_18_29) >= 0
        });
    }
  }
} // component class