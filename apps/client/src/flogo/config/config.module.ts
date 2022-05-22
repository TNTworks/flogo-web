import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlogoConfigComponent } from './config.component';
import { ServiceStatusIndicatorComponent } from './service-status-indicator.component';
import { ConfigRoutingModule } from './config-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, ConfigRoutingModule],
  declarations: [FlogoConfigComponent, ServiceStatusIndicatorComponent],
})
export class ConfigModule {}
