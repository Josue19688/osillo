import { ApiProperty } from "@nestjs/swagger";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserImage } from "./user-image.entity";
import { Inventario } from "src/inventario/entities/inventario.entity";
import { InventarioImage } from "src/inventario/entities/inventario-image.entity";




@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text',{
        unique:true
    })
    email?:string;

    @Column('text',{
        select:false
    })
    password?:string;

    @Column('text')
    fullName?:string;

    @Column('bool',{
        default:false
    })
    isActive?:boolean;

    @Column('text',{
        array:true,
        default:['user']
    })
    roles?:string[];

    @Column('uuid',{ unique: true})
    activationToken: string;


    @Column('uuid',{ 
        unique: true,  
        nullable: true 
    })
    resetPasswordToken: string;

    @CreateDateColumn({ type: 'timestamptz',default: () => "CURRENT_TIMESTAMP(6)"  })
    createdAt: Date;

    //TODO:RELACIONES CON IMAGES DE USUARIOS

    @ApiProperty({
        example:"http://localhost:3000/api/v1/files/product/6f77b86c-cc9a-4848-b982-e2f382a69ec3.png",
        description:'Retornara una o un arreglo de images'
    })
    @OneToMany(
        ()=>UserImage,
        (userImage)=>userImage.user,
        {cascade:true,eager:true}
    )
    images?:UserImage[];


    //TODO:RELACIONES CON INVENTARIOS

    @OneToMany(
        ()=>Inventario,
        (inventario)=>inventario.user
    )
    inventario:Inventario;

    @OneToMany(
        ()=>InventarioImage,
        (inventarioImage)=>inventarioImage.user
    )
    inventarioImage:InventarioImage;

    
   

    

    @BeforeInsert()
    checkFieldBeforeInsert(){
        this.email=this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldBeforeUpdate(){
        this.email=this.email.toLowerCase().trim();
    }

}
