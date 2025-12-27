import { CreatePartnerDto } from './create-partner.dto';
declare const UpdatePartnerDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePartnerDto>>;
export declare class UpdatePartnerDto extends UpdatePartnerDto_base {
    isActive?: boolean;
}
export {};
