import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { Typography, Grid, Container, IconButton, TableCell, TableRow } from '@material-ui/core';
import Tabs from '../components/Tabs'
import Spinner from '../components/Spinner'
import Detalle from '../components/Detalle'
import Modal from '../components/Modal'
import Tabla from '../components/Tabla'
import Tooltip from '@material-ui/core/Tooltip';
import FormSepararItems from '../components/FormSepararItems';
import FormCotizacion from '../components/FormCotizacion';
import FormItemTraslado from '../components/FormItemTraslado';
import FormItemRecibido from '../components/FormItemRecibido';
import BotonMenuItems from '../components/BotonMenuItems';
import FormRechazoSolicitud from '../components/FormRechazoSolicitud';
import FormEntregarItems from '../components/FormEntregarItems';
import FormListoParaEntrega from '../components/FormListoParaEntrega';
import * as solicitudesUsuarioDuck from '../ducks/SolicitudesUsuario'
import * as solicitudesAprobarDuck from '../ducks/SolicitudesAprobar'
import * as solicitudesDuck from '../ducks/Solicitudes'
import * as idsolicitudDuck from '../ducks/Idsolicitud'
import * as iditemDuck from '../ducks/Iditem'
import * as itemsDuck from '../ducks/Items'
import * as aprobador1Duck from '../ducks/Aprobador1'
import * as aprobador2Duck from '../ducks/Aprobador2'
import * as vehiculoDuck from '../ducks/Vehiculos'
import * as mensajesDuck from '../ducks/Mensajes'
import * as modoEdicionDuck from '../ducks/ModoEdicion'
import * as gruposCotizacionDuck from '../ducks/GruposCotizacion'
import * as cotizacionesDuck from '../ducks/Cotizaciones'
import * as idGrupoCotizacionDuck from '../ducks/IdGrupoCotizacion'
import * as itemsCotizacionDuck from '../ducks/ItemsCotizacion'
import * as archivoDuck from '../ducks/Archivo'
import * as itemsCotizadosDuck from '../ducks/ItemsCotizados'
import * as proyectosGeneralDuck from '../ducks/ProyectosGeneral'
import * as gerenciasGeneralDuck from '../ducks/GerenciasGeneral'
import * as comprobanteRecepcionDuck from '../ducks/ComprobanteRecepcion';
import * as trasladoItemRecursoDuck from '../ducks/TrasladoItemRecurso'
import * as entregaItemRecurso from '../ducks/EntregaItemRecurso';
import moment from 'moment'
import 'moment/locale/es'


class Solicitudes extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            openModalRechazo: false,
            openModalSeparar: false,
            openModalEntregar: false,
            openCrearCotizacion: false,
            openVerCotizacion: false,
            openItemTraslado: false,
            openItemRecibido: false,
            openListoEntrega: false,
            confirmacion: false,
            accion: null,
            loading: false,
            mostrarFormulario: true,
            mostrarBusqueda: true,
            mostrarDetalle: false,
            loadingDetalle: true,
            comprobante: "",
            cantidadItemsEntregados: 0,
            textoItemsEntregados: "",
            maxItemsEntrega: 0,
            cantidadItemsRecibidos: 0,
            textoItemsRecibidos: "",
            maxItemsRecibidos: 0,
            textoItemsEnTraslado: "",
            maxItemsEnTraslado: 0,
        }
    }

    async componentDidMount() {
        const { fetchSolicitudesUsuario, fetchSolicitudesAprobar, fetchSolicitudes, usuarioAutenticado } = this.props
        await Promise.all([fetchSolicitudes(), fetchSolicitudesUsuario(usuarioAutenticado.data.id, "", "", "", "", ""), fetchSolicitudesAprobar(usuarioAutenticado.data.id, "", "", "", "", "")])
    }

    //******** MODALES ************
    handleClose = () => {
        this.setState({ ...this.state, openItemRecibido: false, openItemTraslado: false, openVerCotizacion: false, accion: false, confirmacion: false, open: false, openModalRechazo: false, openModalSeparar: false, openModalEntregar: false, openListoEntrega: false })
    }

    handleCloseCotizacion = () => {
        const { toggleModoEdicion } = this.props
        toggleModoEdicion(false)
        this.setState({ ...this.state, accion: false, openVerCotizacion: false, openCrearCotizacion: false, confirmacion: false })
    }

    //FUNCTIONES VISTA SOLICITUDES
    //Submit del formulario de busqueda
    handleSubmit = async data => {
        this.setState({ ...this.state, mostrarBusqueda: true })
        const { fetchSolicitudesUsuario, fetchSolicitudesAprobar, fetchSolicitudes, usuarioAutenticado } = this.props
        try {
            await fetchSolicitudes()
            await fetchSolicitudesUsuario(
                usuarioAutenticado.data.id,
                data.gerencia ? data.gerencia : "",
                data.estado ? data.estado : "",
                data.proyecto ? data.proyecto : "",
                data.fechaDesde ? data.fechaDesde : "",
                data.fechaHasta ? data.fechaHasta : "")
            await fetchSolicitudesAprobar(
                usuarioAutenticado.data.id,
                data.gerencia ? data.gerencia : "",
                data.estado ? data.estado : "",
                data.proyecto ? data.proyecto : "",
                data.fechaDesde ? data.fechaDesde : "",
                data.fechaHasta ? data.fechaHasta : "")
        } catch (error) {
            console.log(error)

        }
    }

    //Funcion para regresar al tablero de solicitudes
    handleRegresar = e => {
        this.setState({ ...this.state, loadingDetalle: true, mostrarBusqueda: true, mostrarFormulario: true, mostrarDetalle: false })
    }

    //Funcion para ir a la vista de detalle de la solicitud
    handleDetalle = id => e => {
        this.setState({ ...this.state, loadingDetalle: true, mostrarBusqueda: false, mostrarFormulario: false, mostrarDetalle: true }, async () => {
            const { assignIdsolicitud, fetchSolicitudes, fetchGruposCotizacion, fetchCotizaciones, fetchItems, fetchAprobador1, fetchAprobador2, usuarioAutenticado } = this.props
            await Promise.all([fetchSolicitudes(), fetchItems(id), fetchAprobador1(id, usuarioAutenticado.data.id), fetchAprobador2(id, usuarioAutenticado.data.id), fetchGruposCotizacion(), fetchCotizaciones()])
            assignIdsolicitud(id)
            this.setState({ ...this.state, loadingDetalle: false })
            
        })
    }
    
    handleActualizar = async e => {
        const { fetchSolicitudes, fetchSolicitudesAprobar, fetchSolicitudesUsuario, usuarioAutenticado, form } = this.props
        await Promise.all([
            fetchSolicitudes(),
            fetchSolicitudesUsuario(
                usuarioAutenticado.data.id,
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.gerencia ? form.busqeda.values.gerencia : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.estado ? form.busqeda.values.estado : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.proyecto ? form.busqeda.values.proyecto : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.fechaDesde ? form.busqeda.values.fechaDesde : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.fechaHasta ? form.busqeda.values.fechaHasta : "") : "") : ""),
            fetchSolicitudesAprobar(
                usuarioAutenticado.data.id,
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.gerencia ? form.busqeda.values.gerencia : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.estado ? form.busqeda.values.estado : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.proyecto ? form.busqeda.values.proyecto : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.fechaDesde ? form.busqeda.values.fechaDesde : "") : "") : "",
                form.busqeda ? (form.busqeda.values ? (form.busqeda.values.fechaHasta ? form.busqeda.values.fechaHasta : "") : "") : ""),
        ])
    }
    //FUNCIONES DETALLES DE APROBACION DE LA SOLICITUD
    //Funcion para el modo de edicion
    /*handleEdit = id => e => {
        const { assignIditem, toggleModoEdicion } = this.props
        assignIditem(id)
        toggleModoEdicion(true)
    }

    //funcion para salir del modo de edicion
    handleNoEdit = e => {
        const { assignIditem, toggleModoEdicion } = this.props
        assignIditem('')
        toggleModoEdicion(false)
    }

    //Abrir el Modal de aprobación de solicitud
    handleAprobarModal = e => {
        const { assignMensaje } = this.props
        assignMensaje('¿Desea aprobar la solicitud?')
        this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleAprobarSolicitud })
    }

    //funcion para aprobar la solicitud
    handleAprobarSolicitud = async () => {
        const { aprobarSolicitud, assignMensaje, idSolicitud, usuarioAutenticado, items, editarItem, solicitudActual } = this.props
        try {
            await aprobarSolicitud(idSolicitud, usuarioAutenticado.data.id)
            items.data.map(x => editarItem({ ...x, estado: solicitudActual[0].estado === 1 ? 2 : 3 }))
            assignMensaje('Solicitud Aprobada')
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)
        }

    }

    //Edicion de item mediante formulario
    handleSubmitEdicion = async values => {
        const { idItem, assignIditem, items, editarItems, toggleModoEdicion } = this.props
        let itemEditado = items.data.filter(x => x.id === idItem)[0]
        itemEditado = { ...itemEditado, ...values }
        await editarItems(idItem, itemEditado)
        toggleModoEdicion(false)
        assignIditem('')
    }

    //Modal de rechazo de item
    handleRechazarItemModal = id => e => {
        const { assignMensaje, assignIditem } = this.props
        assignIditem(id)
        assignMensaje('¿Desea rechazar el item?')
        this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleRechazarItem })
    }

    //Rechazar Item
    handleRechazarItem = async () => {
        const { assignIditem, delItem, assignMensaje, rechazarItem, idItem, usuarioAutenticado } = this.props
        try {
            await rechazarItem(idItem, usuarioAutenticado.data.id)
            assignIditem('')
            assignMensaje('Item Rechazado')
            delItem(idItem)
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)
        }
    }

    //Modal para rechazo de solicitud
    handleRechazarSolicitudModal = () => {
        const { assignMensaje } = this.props
        this.setState({ ...this.state, confirmacion: false, openModalRechazo: true, accion: false })
    }

    //Funcion para rechazar la solicitud de recursos
    handleRechazarSolicitud = async values => {
        const { rechazarSolicitud, usuarioAutenticado, idSolicitud, solicitudActual } = this.props
        const form = {
            ...values,
            fecha: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            solicitud_recurso_id: idSolicitud,
            usuario_id: usuarioAutenticado.data.id,
            estado_id: solicitudActual[0] ? (solicitudActual[0].estado === 1 ? 4 : 5) : "",
        }
        try {
            await rechazarSolicitud(form)
            this.setState({ ...this.state, confirmacion: false, openModalRechazo: false, accion: false })
        } catch (error) {
            console.log(error)
        }
    }

    handleOnChangeFileComprobante = (e) => {
        this.setState({ ...this.state, comprobante: e.target.files[0].name });
    }

    //FUNCIONES PARA REVISION DE STOCK

    //Verificar estado de la solicitud
    /*verificarEstadoSolicitud = async itemsEditados => {
        const { idSolicitud, solicitudActual, editarSolicitudes } = this.props
        if (itemsEditados.some(x => x.estado === 3)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 3 })
        } else if (itemsEditados.some(x => x.estado === 7)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 7 })
        } else if (itemsEditados.some(x => x.estado === 8)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 8 })
        } else if (itemsEditados.some(x => x.estado === 9)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 9 })
        } else if (itemsEditados.some(x => x.estado === 12)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 12 })
        } else if (itemsEditados.some(x => x.estado === 6)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 6 })
        } else if (itemsEditados.some(x => x.estado === 17)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 17 })
        } else if (itemsEditados.some(x => x.estado === 18)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 18 })
        } else if (itemsEditados.some(x => x.estado === 20)) {
            await editarSolicitudes(idSolicitud, { ...solicitudActual[0], estado: 20 })
        }
    }

    //Modal para edición de items
    handleEditarItemsModal = (id, accion) => async e => {
        const { assignMensaje, fetchItems, consultarItem, itemsCotizacionActual, consultarItemCotizacion, assignIditem, items, idSolicitud, consultarItemCompleto } = this.props
        let cantidadAnterior = items.data.filter(x => x.id === id)[0].cantidad
        switch (accion) {
            case 6:
                this.setState({ ...this.state, open: true, confirmacion: false, accion: false }, async () => {
                    assignMensaje('Cargando')
                    let itemActual = await consultarItem(id);
                    if ((itemActual.estado === 3 || itemActual.estado === 7) && itemActual.cantidad === cantidadAnterior) {
                        assignMensaje('¿Desea aplicar acción EXISTE?')
                        this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleEditarItems(id, accion) })
                    } else if (itemActual.estado === 12 && itemActual.cantidad === cantidadAnterior) {
                        //assignMensaje('¿Desea aplicar acción RECIBIDO?')
                        //this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleEditarItems(id, accion) })
                        await assignIditem(id);
                        let itemCotizacion = itemsCotizacionActual.data.filter(x => x.item_recurso_id === id)[0]
                        let itemActualCotizacion = await consultarItemCotizacion(itemCotizacion.id)
                        var totalRecibidos = 0;
                        if(itemActualCotizacion.recepciones){
                            for(var e = 0; e < itemActualCotizacion.recepciones.length; e++){
                                totalRecibidos += itemActualCotizacion.recepciones[e].cantidad;
                            }
                        }
                        let recibidos = totalRecibidos + " de " + itemActualCotizacion.cantidad;
                        let maxRecibidos = itemActualCotizacion.cantidad - totalRecibidos;
                        this.setState({ ...this.state, confirmacion: false, openItemRecibido: true, accion: false, cantidadItemsRecibidos: totalRecibidos, totalRecibir: itemActual.cantidad, textoItemsRecibidos: recibidos, maxItemsRecibidos: maxRecibidos})
                    } else {
                        await fetchItems(idSolicitud)
                        assignMensaje('Lista de Items actualizada')
                        this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
                    }
                })
                break;
            case 7:
                assignMensaje('¿Desea aplicar acción SOLICITAR?')
                this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleEditarItems(id, accion) })
                break;
            case 8:
                assignMensaje('¿Desea aplicar acción COMPRAR?')
                this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleEditarItems(id, accion) })
                break;
            case 18:
                {// assignMensaje('¿Desea aplicar acción LISTO PARA ENTREGA?')
                    let itemActual = await consultarItemCompleto(id);
                    await assignIditem(id);
                    let listos = itemActual.cantidad_listos_entrega + " de " + itemActual.cantidad;
                    let maxListos = itemActual.cantidad - itemActual.cantidad_listos_entrega;
                    this.setState({ ...this.state, confirmacion: true, openListoEntrega: true, accion: accion, textoItemsListoEntrega: listos, maxItemsListoEntrega: maxListos });
                    break;
                }
            case 17:
                {
                    await assignIditem(id);
                    let itemActual = await consultarItemCompleto(id);
                    let max = itemActual.cantidad;
                    let enTraslado = 0;
                    if (itemActual.traslados) {
                        for (let i = 0; i < itemActual.traslados.length; i++) {
                            enTraslado += itemActual.traslados[i].cantidad;
                        }
                    }
                    if (itemActual.cotizaciones) {
                        max = 0;
                        for (let i = 0; i < itemActual.cotizaciones.length; i++) {
                            let recepciones = itemActual.cotizaciones[i].recepciones;
                            if (recepciones) {
                                for (let j = 0; j < recepciones.lenght; j++) {
                                    max = recepciones[j].cantidad;
                                }
                            }
                        }
                    }
                    let textoEnTraslado = enTraslado + " de " + max;
                    console.log(textoEnTraslado);
                    console.log(max);
                    this.setState({ ...this.state, confirmacion: false, openItemTraslado: true, accion: false, textoItemsEnTraslado: textoEnTraslado, maxItemsEnTraslado: max });
                    break;
                }
            case 20:
                {
                    // assignMensaje('¿Desea aplicar acción ENTREGADO?')
                    // this.setState({...this.state, confirmacion: true, open: true, accion: this.handleItemEntregado(id) })     
                    assignMensaje('Cargando');
                    let itemActual = await consultarItemCompleto(id);
                    await assignIditem(id);
                    var totalEntregados = 0;
                    if (itemActual.entregas) {
                        for (var e = 0; e < itemActual.entregas.length; e++) {
                            totalEntregados += itemActual.entregas[e].cantidad;
                        }
                    }
                    let entregados = totalEntregados + " de " + itemActual.cantidad;
                    let maxEntrega = itemActual.cantidad - totalEntregados;
                    this.setState({ ...this.state, confirmacion: false, openModalEntregar: true, accion: false, cantidadItemsEntregados: totalEntregados, totalEntregar: itemActual.cantidad, textoItemsEntregados: entregados, maxItemsEntrega: maxEntrega })
                    break;
                }
            case 'separar':
                {
                    this.setState({ ...this.state, open: true, confirmacion: false, accion: false }, async () => {
                        assignMensaje('Cargando')
                        let itemActual = await consultarItem(id)
                        if (itemActual.cantidad === cantidadAnterior) {
                            await assignIditem(id)
                            this.setState({ ...this.state, confirmacion: false, openModalSeparar: true, accion: false })
                        } else {
                            await fetchItems(idSolicitud)
                            assignMensaje('Lista de Items actualizada')
                            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
                        }
                    })

                    break;
                }
            default:
                break;
        }
    }

    // handleItemListo = (id, accion) => async e => {
    //     const { editarItemListo, assignMensaje } = this.props
    //     editarItemListo(id)
    //     assignMensaje('Item Editado con éxito')
    //     this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
    // }

    handleItemEntregado = id => async e => {
        const { items, editarItems, assignMensaje, usuarioAutenticado } = this.props
        let item = items.data.filter(x => x.id === id)
        await editarItems(id, { ...item, estado: 20, entregado_por_id: usuarioAutenticado.data.id, fecha_entrega: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') })
        let itemsEditados = items.data.map(x => { if (x.id === id) { return { ...x, estado: 20, entregado_por_id: usuarioAutenticado.data.id, fecha_entrega: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') } } else { return x } })
        this.verificarEstadoSolicitud(itemsEditados)
        assignMensaje('Item Entregado')
        this.setState({ ...this.state, confirmacion: false, open: true, open: true, accion: false })
    }

    handleItemTraslado = async values => {
        const { idItem, items, assignMensaje, usuarioAutenticado, agregarTrasladoItemRecurso } = this.props;
        try {
            const form = {
                informacion_traslado: values.info_traslado,
                numero_seguimiento: values.numero_traslado,
                item_recurso_id: idItem,
                cantidad: values.cantidad,
                fecha: moment().format("YYYY-MM-DD"),
                entregado_por_id: usuarioAutenticado.data.id,
                usuario_id: usuarioAutenticado.data.id
            };
            const traslado = await agregarTrasladoItemRecurso(form);
            console.log(traslado);
            assignMensaje('Item en traslado');
            this.setState({ ...this.state, openModalEntregar: false, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)
        }
    }


    //Funcion para separar Items
    handleSepararItems = async values => {
        const { items, idItem, addItems, editarItems, assignMensaje, idSolicitud, fetchItemsCotizacion } = this.props
        let item = items.data.filter(x => x.id === idItem)[0]
        if (item.cantidad > 1 && values.cantidad > 0) {
            if (values.cantidad < item.cantidad) {
                item = { ...item, fecha_requerida: moment(item.fecha_requerida).format('YYYY-MM-DD'), cantidad: item.cantidad - values.cantidad }
                let newItem = { ...item, fecha_requerida: moment(item.fecha_requerida).format('YYYY-MM-DD'), cantidad: values.cantidad }
                try {
                    await editarItems(idItem, item)
                    await addItems(newItem)
                    await fetchItemsCotizacion(idSolicitud)
                    assignMensaje('Items separados con exito')
                    this.setState({ ...this.state, openModalSeparar: false, confirmacion: false, open: true, accion: false })
                } catch (error) {
                    console.log(error)
                }
            } else {
                assignMensaje('La cantidad a separar no puede ser mayor que la cantidad de items')
                this.setState({ ...this.state, openModalSeparar: false, confirmacion: false, open: true, accion: false })
            }
        } else {
            assignMensaje('Para separar el item la cantidad debe ser mayor que 1')
            this.setState({ ...this.state, openModalSeparar: false, confirmacion: false, open: true, accion: false })
        }
    }

    //Funcion para editar Items
    handleEditarItems = (id, accion) => async e => {
        const { editarItems, assignMensaje, items, solicitudActual } = this.props;
        let item = items.data.filter(x => x.id === id)[0]
        let itemsEditados
        item = { ...item, estado: accion, fecha_requerida: moment(item.fecha_requerida).format('YYYY-MM-DD'), ubicacion_logistica: accion === 7 ? 2 : item.ubicacion_logistica }
        try {
            await editarItems(id, item)
            itemsEditados = items.data.map(x => { if (x.id === id) { return { ...x, estado: accion, ubicacion_logistica: accion === 7 ? 2 : item.ubicacion_logistica } } else { return x } })
            this.verificarEstadoSolicitud(itemsEditados)
            assignMensaje('Item Editado con éxito')
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)

        }
    }


    //FUNCIONES PARA COTIZACIONES
    //Modal crear grupo cotizacion
    /*handleCrearGrupoCotizacionModal = e => {
        const { assignMensaje } = this.props
        assignMensaje('¿Desea crear un grupo de cotización?')
        this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleCrearGrupoCotizacion })
    }

    //Crear grupoCotizacion
    handleCrearGrupoCotizacion = async () => {
        const { agregarGrupoCotizacion, idSolicitud, assignMensaje } = this.props
        try {
            await agregarGrupoCotizacion({ solicitud_recurso_id: idSolicitud, fecha: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') })
            assignMensaje('El grupo de cotización ha sido creado')
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)

        }

    }

    //Modal para solicitar Aprobacion
    handleSolicitarAprobacionModal = e => {
        const { assignMensaje } = this.props
        assignMensaje('¿Desea solicitar aprobación de sus cotizaciones?')
        this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleSolicitarAprobacion })
    }

    //Solicitar Aprobacion
    handleSolicitarAprobacion = async () => {
        const { cotizaciones, assignMensaje, editarItems, fetchItemsCotizados, items, solicitarAprobacionCotizacion } = this.props
        if (cotizaciones.length > 0) {
            try {
                await Promise.all(cotizaciones.filter(x => x.activo ? true : false).map(async x => {
                    let itemsCotizados = await fetchItemsCotizados(x.id)
                    itemsCotizados = items.data.filter(x => itemsCotizados.some(y => y.item_recurso_id === x.id))
                    await Promise.all(itemsCotizados.map(async y => {
                        if (y.estado === 8) {
                            return {
                                items: await editarItems(y.id, { ...y, fecha_requerida: moment(y.fecha_requerida).format('YYYY-MM-DD'), estado: 9 })
                            }
                        }
                    }))
                    return {
                        solicitud: await solicitarAprobacionCotizacion(x.id)
                    }
                }))
                assignMensaje('Solicitudes de Aprobación enviadas con éxito')
                this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
            } catch (error) {
                assignMensaje('Fallo la solicitud, contacte a soporte')
                this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
            }
        } else {
            assignMensaje('No puede solicitar aprobación si no hay cotizaciones ')
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        }
    }

    //Modal para crear la cotizacion
    handleCrearCotizacionModal = async () => {
        const { fetchItemsCotizacion, selectCotizacion, idSolicitud } = this.props
        selectCotizacion('')
        this.setState({ ...this.state, confirmacion: false, openCrearCotizacion: true, accion: false })
        await fetchItemsCotizacion(idSolicitud)

    }

    //Funcion para crear una nueva cotización
    handleCrearCotizacion = async values => {
        const { idGrupoCotizacion, toggleModoEdicion, itemsCotizacionActual, editarItemsCotizados, cotizacionSelected, editarCotizaciones, asignarArchivo, agregarItemsCotizados, assignMensaje, idSolicitud, usuarioAutenticado, agregarCotizacion, itemsCotizados, cotizaciones, formCotizacion, modoEdicion } = this.props
        let iva = (formCotizacion ? (formCotizacion.values ? (formCotizacion.values.impuesto_incluido ? false : true) : false) : false) ? (formCotizacion ? (formCotizacion.values ? (formCotizacion.values.iva ? 0 : (itemsCotizados.map(x => x.precio ? (x.precio.replace(/\./g, "") * x.cantidad) : 0).reduce((acc, y) => { return acc + y }) * 0.19)) : "") : "") : 0
        let total = (formCotizacion ? (formCotizacion.values ? (formCotizacion.values.impuesto_incluido ? false : true) : false) : false) ? (formCotizacion ? (formCotizacion.values ? (formCotizacion.values.iva ? itemsCotizados.map(x => x.precio ? (x.precio.replace(/\./g, "") * x.cantidad) : 0).reduce((acc, y) => { return acc + y }) : (itemsCotizados.map(x => x.precio ? (x.precio.replace(/\./g, "") * x.cantidad) : 0).reduce((acc, y) => { return acc + y }) * 1.19)) : "") : "") : itemsCotizados.map(x => x.precio ? (x.precio.replace(/\./g, "") * x.cantidad) : 0).reduce((acc, y) => { return acc + y })
        let itemsCotizadosCrear
        if (modoEdicion) {
            itemsCotizadosCrear = itemsCotizados.filter(x => itemsCotizacionActual.data.some(y => y.item_recurso_id === x.id)).map(x => ({ ...x, item_recurso_id: x.id, descripcion: values[`descripcion{${x.id}}`], precio: (x.precio.replace(/\./g, "") * x.cantidad) }))
        } else {
            itemsCotizadosCrear = itemsCotizados.map(x => ({ ...x, item_recurso_id: x.id, descripcion: values[`descripcion{${x.id}}`], precio: (x.precio.replace(/\./g, "") * x.cantidad) }))
        }
        if (modoEdicion) {
            if (itemsCotizadosCrear.every(x => x.precio !== null)) {
                await editarCotizaciones(cotizacionSelected[0].id, { ...values, fecha: moment(new Date()).format('YYYY-MM-DD HH:mm-ss'), impuesto_incluido: values.impuesto_incluido ? values.impuesto_incluido : false, solicitud_recurso_id: idSolicitud, grupo_cotizacion_id: idGrupoCotizacion, creador_id: usuarioAutenticado.data.id, monto_total: total, iva: iva })
                Promise.all(itemsCotizadosCrear.map(async x => {
                    return {
                        item: await editarItemsCotizados(itemsCotizacionActual.data.filter(y => y.item_recurso_id === x.id)[0].id, { ...x })
                    }
                }))
                toggleModoEdicion(false)
                assignMensaje('Su cotización fue Editada con éxito')
                this.setState({ ...this.state, confirmacion: false, openCrearCotizacion: false, open: true, accion: false })

            } else {
                assignMensaje('Todos los items deben tener un precio asignado')
                this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
            }
        } else {
            if (values.archivo) {
                if (itemsCotizados.every(x => x.precio !== null)) {
                    const formArchivo = { file: values.archivo, mime_type: values.archivo.type, name: values.archivo.name, size: values.archivo.size, chunk: "" }
                    try {
                        let archivo = await asignarArchivo(formArchivo)
                        let cotizacionActual = await agregarCotizacion({ ...values, fecha: moment(new Date()).format('YYYY-MM-DD HH:mm-ss'), impuesto_incluido: values.impuesto_incluido ? values.impuesto_incluido : false, solicitud_recurso_id: idSolicitud, grupo_cotizacion_id: idGrupoCotizacion, creador_id: usuarioAutenticado.data.id, monto_total: total, archivo_id: archivo.id, iva: iva })
                        await agregarItemsCotizados({ items: itemsCotizadosCrear.map(x => ({ ...x, cotizacion_id: cotizacionActual.id })) })
                        assignMensaje('Su cotización fue creada con éxito')
                        this.setState({ ...this.state, confirmacion: false, openCrearCotizacion: false, open: true, accion: false })
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    assignMensaje('Todos los items deben tener un precio asignado')
                    this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
                }
            } else {
                assignMensaje('Debe adjuntar un archivo de cotización')
                this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
            }
        }
    }

    //Asignar Id del grupo de cotizacion actual 
    handleIdGrupoCotizacion = id => e => {
        const { assignIdGrupoCotizacion } = this.props
        assignIdGrupoCotizacion(id)
    }

    /*Modal para eliminar item de la cotizacion
    handleEliminarItemCotizacionModal= id => e => {
        const { assignMensaje } = this.props
        assignMensaje('¿Desea eliminar el item de la cotización?')
        this.setState({...this.state, confirmacion: true, open: true, accion: this.handleEliminarItemCotizacion(id)})
    }

    //Funcion para eliminar Items de la cotizacion
    handleEliminarItemCotizacion = id => e => {
        const { delItemsCotizacion, itemsCotizados, assignMensaje } = this.props
        if (itemsCotizados.length > 1) {
            delItemsCotizacion(id)
            //assignMensaje('Item Eliminado')
            //this.setState({...this.state, confirmacion: false, open: true, accion: false })
        } else {
            assignMensaje('Debe cotizar al menos un Item')
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        }
    }

    handleCotizacionModal = (accion, id) => async e => {
        const { assignMensaje, fetchItemsCotizacion, toggleModoEdicion, idSolicitud, selectCotizacion, fetchItemsCotizados } = this.props
        switch (accion) {
            case "aprobar":
                assignMensaje(`¿Esta seguro que desea aprobar la cotización?`)
                this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleAprobarCotizacion(id) })
                break;
            case "rechazar":
                assignMensaje(`¿Esta seguro que desea rechazar la cotización?`)
                this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleRechazarCotizacion(id) })
                break;
            case "borrar":
                assignMensaje(`¿Esta seguro que desea borrar la cotización?`)
                this.setState({ ...this.state, confirmacion: true, open: true, accion: this.handleBorrarCotizacion(id) })
                break;
            case "editar":
                await fetchItemsCotizados(id)
                selectCotizacion(id)
                toggleModoEdicion(true)
                this.setState({ ...this.state, confirmacion: false, openCrearCotizacion: true, accion: false })
                await fetchItemsCotizacion(idSolicitud)
                break;
            case "ver":
                await fetchItemsCotizados(id)
                selectCotizacion(id)
                this.setState({ ...this.state, confirmacion: false, openVerCotizacion: true, accion: false })
                break;
            default:
                break;
        }
    }

    handleBorrarCotizacion = id => async e => {
        const { editarCotizaciones, cotizaciones, assignMensaje } = this.props
        let cotizacion = cotizaciones.filter(x => x.id === id)[0]
        await editarCotizaciones(id, { ...cotizacion, activo: false })
        assignMensaje("Cotización Borrada")
        this.setState({ ...this.state, open: true, confirmacion: false, accion: false })
    }

    handleAprobarCotizacion = id => async e => {
        const { items, fetchItemsCotizados, assignMensaje, cotizaciones, aprobarCotizacion, usuarioAutenticado, idSolicitud, fetchItems } = this.props
        let itemsCotizados = await fetchItemsCotizados(id)
        console.log(itemsCotizados)
        itemsCotizados = items.data.filter(x => itemsCotizados.some(y => y.item_recurso_id === x.id))
        if (itemsCotizados.some(x => x.estado === 9)) {
            let cotizacionActual = cotizaciones.filter(x => x.id === id)[0]
            await aprobarCotizacion(id, { ...cotizacionActual, aprobada: 1 }, usuarioAutenticado.data.id)
            await fetchItems(idSolicitud)
            assignMensaje(`Cotización aprobada`)
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        } else if (itemsCotizados.some(x => x.estado === 8)) {
            assignMensaje(`Debe esperar que el responsable solicite la aprobación`)
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        } else {
            assignMensaje(`Items ya fueron aprobados en otra cotización`)
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false })
        }
    }

    handleRechazarCotizacion = id => e => {
        console.log("rechazando", id)
    }

    handleVerDocumento = id => e => {
        const { usuario } = this.props
        usuario.getIdToken().then(async function (idToken) {
            console.log(idToken);
            const documento = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${idToken}`)
        });

    }*/


    /*handleEntregarItems = async values => {
        const { items, idItem, assignMensaje, agregarComprobante, agregarEntregaItemRecurso, usuarioAutenticado } = this.props;
        const item = items.data.filter(x => x.id === idItem)[0];
        let fecha = values.fecha.split("/");
        try {
            const formComprobante = {
                file: values.file,
                mime_type: values.file.type,
                name: values.file.name,
                size: values.file.size,
                chunk: values.file.size,
                numero: values.numero,
                fecha: fecha[2] + fecha[1] + fecha[0]
            };
            const comprobante = await agregarComprobante(formComprobante);
            const formEntrega = {
                documento_entrega_id: comprobante.id,
                item_recurso_id: idItem,
                cantidad: values.cantidad,
                fecha: moment().format("YYYY-MM-DD"),
                entregado_por_id: usuarioAutenticado.data.id
            };
            const entrega = await agregarEntregaItemRecurso(formEntrega);
            assignMensaje('Entrega realizada con éxito');
            this.setState({ ...this.state, openModalEntregar: false, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)
        }

    }

    handleItemRecibido = async values => {
        const { items, idItem, fetchItemsCotizados, fetchItems, idSolicitud, assignMensaje, itemsCotizacionActual, consultarCotizacion, cotizacionSelected, agregarGuiaDespacho, agregarFactura, agregarRecepcionItemRecurso, usuarioAutenticado } = this.props;
        const item = items.data.filter(x => x.id === idItem)[0];
        let cotizacion = await consultarCotizacion(cotizacionSelected[0].id)
        let itemCotizacion = itemsCotizacionActual.data.filter(x => x.item_recurso_id === idItem)[0]
        let fecha = values.fecha.split("/");
        try {
            const formComprobante = {
                file: values.file,
                mime_type: values.file.type,
                name: values.file.name,
                size: values.file.size,
                chunk: values.file.size,
                numero: values.numero,
                fecha: fecha[2]+fecha[1]+fecha[0],
                orden_compra_id: cotizacion.orden_compra.id,
                monto: values.monto ? values.monto : "",
            };
            let comprobante
            if(values.tipo_doc === "Guía Despacho"){
                comprobante = await agregarGuiaDespacho(formComprobante);
            }else{
                comprobante = await agregarFactura({...formComprobante, fecha_factura: formComprobante.fecha, monto: values.monto});
            }
            const formRecepcion = {
                cantidad: values.cantidad,
                fecha: moment().format("YYYY-MM-DD"),
                item_cotizacion_id: itemCotizacion.id,
                usuario_id: usuarioAutenticado.data.id
            };

            await agregarRecepcionItemRecurso(formRecepcion);
            await fetchItemsCotizados(cotizacionSelected[0].id)
            await fetchItems(idSolicitud)
            assignMensaje('Recepción realizada con éxito');
            this.setState({ ...this.state, openItemRecibido: false, modal: true, confirmacion: false, open: true, accion: false })
        } catch (error) {
            console.log(error)
        }
    }
    
    handleListoParaEntregar = async (values) => {
        const { accion } = this.state;
        const { items, idItem, assignMensaje, editarItems, usuarioAutenticado } = this.props;
        console.log(values);
        console.log(idItem);
        let item = items.data.filter(x => x.id === idItem)[0];
        let listos_entrega = item.cantidad_listos_entrega + values.cantidad;
        item = { cantidad_listos_entrega: listos_entrega, estado: accion };
        console.log(item);
        try {
            await editarItems(idItem, item);
            assignMensaje('Item Editado con éxito');
            this.setState({ ...this.state, confirmacion: false, open: true, accion: false });
        } catch (error) {
            console.log(error);
        }
        this.setState({ ...this.state, openListoEntrega: false });
    }*/
    
    render() {
        const {
            gerencias,
            usuarios,
            items,
            proyectos,
            solicitudActual,
            solicitudes,
            solicitudesUsuario,
            solicitudesAprobar,
            idSolicitud,
            proyectosTodos,
            gerenciasTodas,
            estados,
            /*mensaje,
            modoEdicion,
            cotizaciones,
            gruposCotizacionGeneral,
            empresas,
            centros,
            proveedores,
            formCotizacion,
            itemsCotizacion,
            itemsCotizados,
            clases,
            archivo,
            subClases,
            centroLogistico,
            cotizacionesFetch,
            cotizacionSelected,
            comprobanteRecepcion,
            itemsCotizacionActual,
            formRecibir,            
            usuarioAutenticado,
            idGrupoCotizacion,
            idItem,
            aprobador1,
            aprobador2,
            gruposCotizacion,
            revisarStock,
            revisarCotizacion,
            aprobadoresCotizacion,
            rangosPrecios,
            marcasVehiculos,
            tiposRecursos,*/
        } = this.props
        const { loadingDetalle, mostrarBusqueda, mostrarDetalle, mostrarFormulario } = this.state;
        return (
            <Container >
                {mostrarFormulario &&
                    <Container >
                        <Grid container justify="center" alignItems="center">
                            <Typography style={{ marginBottom: '30px' }} variant="h4">Solicitudes de Recursos</Typography>
                        </Grid>
                    </Container>}
                {mostrarBusqueda &&
                    <Grid container  >
                        <Grid item xs={12} lg={12}>
                            <Tabs handleActualizar={this.handleActualizar} proyectos={proyectos} proyectosTodos={proyectosTodos} gerenciasTodas={gerenciasTodas} fetching={solicitudes.fetching || solicitudesAprobar.fetching || solicitudesUsuario.fetching} handleSubmit={this.handleSubmit} gerencias={gerencias} usuarios={usuarios} data={solicitudesUsuario.data} data1={solicitudesAprobar.data} estados={estados.data} handleDetalle={this.handleDetalle} />
                        </Grid>
                    </Grid>
                }

                {mostrarDetalle &&
                    <Container>
                        <Grid>
                            <Typography align='center' variant="h4" gutterBottom>
                                Detalle del Proceso
                            </Typography>
                        </Grid>
                        <Grid>
                            <Typography align='center' variant="body1" gutterBottom>
                                <Tooltip title="Regresar a solicitudes">
                                    <IconButton onClick={this.handleRegresar}><i className="material-icons">keyboard_arrow_left</i></IconButton>
                                </Tooltip>
                                <Tooltip title="Actualizar">
                                    <IconButton onClick={this.handleDetalle(idSolicitud)}><i className="material-icons">autorenew</i></IconButton>
                                </Tooltip>
                            </Typography>
                        </Grid>
                        {loadingDetalle ? <Spinner /> :
                            <Detalle
                                estados={estados}
                                items={items}
                                solicitud={solicitudActual}
                                /*clases={clases}
                                subClases={subClases}
                                usuarios={usuarios}
                                handleEdit={this.handleEdit}
                                idItem={idItem}
                                handleRechazarItemModal={this.handleRechazarItemModal}
                                handleAprobarModal={this.handleAprobarModal}
                                handleSubmit={this.handleSubmitEdicion}
                                editar={modoEdicion}
                                handleNoEdit={this.handleNoEdit}
                                handleRechazarItemModal={this.handleRechazarItemModal}
                                handleEditarItemsModal={this.handleEditarItemsModal}
                                gruposCotizacion={gruposCotizacion}
                                cotizaciones={cotizaciones}
                                handleCrearGrupoCotizacionModal={this.handleCrearGrupoCotizacionModal}
                                handleSolicitarAprobacionModal={this.handleSolicitarAprobacionModal}
                                handleCrearCotizacionModal={this.handleCrearCotizacionModal}
                                handleIdGrupoCotizacion={this.handleIdGrupoCotizacion}
                                idGrupoCotizacion={idGrupoCotizacion}
                                centros={centros}
                                proveedores={proveedores}
                                empresas={empresas}
                                revisarStock={revisarStock}
                                revisarCotizacion={revisarCotizacion}
                                handleCotizacionModal={this.handleCotizacionModal}
                                centroLogistico={centroLogistico}
                                aprobadoresCotizacion={aprobadoresCotizacion}
                                rangosPrecios={rangosPrecios}
                                usuarioAutenticado={usuarioAutenticado}
                                marcasVehiculos={marcasVehiculos}
                                tiposRecursos={tiposRecursos}*/
                            />}
                    </Container>
                }

                {/*<Modal
                    open={this.state.open}
                    handleClose={this.handleClose}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={itemsCotizacionActual.fetching || solicitudes.fetching || items.fetching || gruposCotizacionGeneral.fetching || cotizacionesFetch.fetching}
                >
                    {mensaje.data}
                </Modal>

                <Modal
                    open={this.state.openModalRechazo}
                    handleClose={this.handleClose}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={solicitudes.fetching || items.fetching}
                >
                    {solicitudes.fetching ? <Spinner /> : <FormRechazoSolicitud onSubmit={this.handleRechazarSolicitud} />}
                </Modal>

                <Modal
                    open={this.state.openModalSeparar}
                    handleClose={this.handleClose}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={items.fetching}
                >
                    {items.fetching ? <Spinner /> : <FormSepararItems onSubmit={this.handleSepararItems} />}
                </Modal>

                <Modal
                    xl={true}
                    title="Cotización"
                    open={this.state.openCrearCotizacion}
                    handleClose={this.handleCloseCotizacion}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={items.fetching}
                >
                    {archivo.fetching || cotizacionesFetch.fetching || itemsCotizacionActual.fetching ? <Spinner /> :
                        <FormCotizacion
                            modoEdicion={modoEdicion}
                            formCotizacion={formCotizacion}
                            cotizaciones={cotizaciones}
                            empresas={empresas}
                            centros={centroLogistico}
                            proveedores={proveedores}
                            clases={clases}
                            subClases={subClases}
                            onSubmit={this.handleCrearCotizacion}
                            handleEditarItemsModal={this.handleEditarItemsModal}
                            handleEliminarItemCotizacion={this.handleEliminarItemCotizacion}
                            loadingItems={itemsCotizacion.fetching}
                            itemsCotizacion={modoEdicion ? itemsCotizados.filter(x => itemsCotizacionActual.data.some(y => y.item_recurso_id === x.id)) : itemsCotizados} />}
                </Modal>

                <Modal
                    open={this.state.openVerCotizacion}
                    handleClose={this.handleCloseCotizacion}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={cotizaciones.fetching}
                >
                    {itemsCotizacion.fetching ? <Spinner /> :
                        <Grid>
                            <Grid item xs={12} lg={12}>
                                <Grid container justify="center" alignItems="center"  >
                                    <Typography variant="h6" gutterBottom>
                                        Detalles de la Cotización
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container >
                                <Grid item xs={12} lg={3}>
                                    <ul>
                                        <ol><strong>Codigo CyD:</strong></ol>
                                        <ol><strong>Empresa CyD:</strong></ol>
                                        <ol><strong>Proveedor:</strong></ol>
                                        <ol><strong>Fecha de Orden:</strong></ol>
                                        <ol><strong>Centro:</strong></ol>
                                        <ol><strong>Monto Total:</strong></ol>
                                        <ol><strong>IVA:</strong></ol>
                                        <ol><strong><IconButton onClick={this.handleVerDocumento(cotizacionSelected[0] && cotizacionSelected[0].archivo_id)}>Ver Documento</IconButton></strong></ol>
                                    </ul>
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                    <ul>
                                        <ol>{cotizacionSelected[0] ? cotizacionSelected[0].codigo : ""}</ol>
                                        <ol>{empresas.data && empresas.data.filter(x => x.id === (cotizacionSelected[0] ? cotizacionSelected[0].empresa_cyd_id : ""))[0] ? empresas.data.filter(x => x.id === (cotizacionSelected[0] ? cotizacionSelected[0].empresa_cyd_id : ""))[0].nombre : ""}</ol>
                                        <ol>{proveedores.data && proveedores.data.filter(x => x.id === (cotizacionSelected[0] ? cotizacionSelected[0].proveedor_id : ""))[0] ? proveedores.data.filter(x => x.id === (cotizacionSelected[0] ? cotizacionSelected[0].proveedor_id : ""))[0].nombre : ""}</ol>
                                        <ol>{moment(cotizacionSelected[0] ? cotizacionSelected[0].fecha_orden : "").format('DD-MM-YYYY')}</ol>
                                        <ol>{centros.data && centros.data.filter(x => x.id === (cotizacionSelected[0] ? cotizacionSelected[0].ubicacion_logistica_id : ""))[0] ? centros.data.filter(x => x.id === (cotizacionSelected[0] ? cotizacionSelected[0].ubicacion_logistica_id : ""))[0].nombre : ""}</ol>
                                        <ol>{cotizacionSelected[0] ? cotizacionSelected[0].monto_total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : ""}</ol>
                                        <ol>{cotizacionSelected[0] ? cotizacionSelected[0].iva.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : ""}</ol>
                                    </ul>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} lg={12}>
                                <Grid container justify="center" alignItems="center"  >
                                    <Typography variant="h6" gutterBottom>
                                        Items de la Cotización
                                    </Typography>
                                </Grid>
                                <Grid container justify="center" alignItems="center"  >
                                    <Tabla
                                        columns={cotizacionSelected[0] && cotizacionSelected[0].aprobada ? ['Cantidad', 'Estado', 'Detalle', 'Descripción', 'Fecha Requerida', 'Accion'] : ['Cantidad', 'Estado', 'Detalle', 'Descripción', 'Fecha Requerida', 'Estado']}
                                    >
                                        {itemsCotizacionActual.data.map((x, id) =>
                                            <TableRow key={id}>
                                                <TableCell>{x.cantidad}</TableCell>
                                                <TableCell>{estados.data.filter(y => y.id === (items.data.filter(z => z.id === x.item_recurso_id)[0] ? items.data.filter(z => z.id === x.item_recurso_id)[0].estado : ""))[0] ? estados.data.filter(y => y.id === (items.data.filter(z => z.id === x.item_recurso_id)[0] ? items.data.filter(z => z.id === x.item_recurso_id)[0].estado : ""))[0].nombre : ""}</TableCell>
                                                <TableCell>{items.data.filter(y => y.id === x.item_recurso_id)[0] ? (items.data.filter(z => z.id === x.item_recurso_id)[0].clase ? "- " + clases.data.filter(y => y.id === items.data.filter(z => z.id === x.item_recurso_id)[0].clase)[0].nombre : "") : ""} {items.data.filter(z => z.id === x.item_recurso_id)[0] ? (items.data.filter(z => z.id === x.item_recurso_id)[0].sub_clase ? "- " + subClases.data.filter(y => y.id === items.data.filter(z => z.id === x.item_recurso_id)[0].sub_clase)[0].nombre : "") : ""}</TableCell>
                                                <TableCell>{x.descripcion}</TableCell>
                                                <TableCell>{moment(items.data.filter(z => z.id === x.item_recurso_id)[0] ? items.data.filter(z => z.id === x.item_recurso_id)[0].fecha_requerida : "").format('DD-MM-YYYY')}</TableCell>
                                                {items.data.filter(y => y.id === x.item_recurso_id)[0] && ((items.data.filter(y => y.id === x.item_recurso_id)[0].estado) === 12) ?
                                                    <TableCell>
                                                        <BotonMenuItems id={items.data.filter(y => y.id === x.item_recurso_id)[0] && items.data.filter(y => y.id === x.item_recurso_id)[0].id} estado={estados.data.filter(y => y.id === (items.data.filter(z => z.id === x.item_recurso_id)[0] ? items.data.filter(z => z.id === x.item_recurso_id)[0].estado : ""))[0] ? estados.data.filter(y => y.id === (items.data.filter(z => z.id === x.item_recurso_id)[0] ? items.data.filter(z => z.id === x.item_recurso_id)[0].estado : ""))[0].id : ""} handleEditarItemsModal={this.handleEditarItemsModal} />
                                                    </TableCell> :
                                                    <TableCell>
                                                        {estados.data.filter(y => y.id === items.data.filter(z => z.id === x.item_recurso_id)[0].estado)[0].nombre}
                                                    </TableCell>}
                                            </TableRow>
                                        )}
                                    </Tabla>
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                </Modal>
                
                <Modal
                    title="Items recibidos"
                    open={this.state.openItemRecibido}
                    handleClose={this.handleClose}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={comprobanteRecepcion.fetching || itemsCotizados.fetching}

                >
                    <FormItemRecibido 
                        entregados={this.state.textoItemsRecibidos}
                        max={this.state.maxItemsRecibidos}
                        onSubmit={this.handleItemRecibido}
                        fileName={this.state.comprobante}
                        handleOnChangeFileComprobante={this.handleOnChangeFileComprobante}
                        formRecibir={formRecibir}

                    />
                </Modal>

                <FormEntregarItems
                    onSubmit={this.handleEntregarItems}
                    open={this.state.openModalEntregar}
                    handleClose={this.handleClose}
                    handleOnChangeFileComprobante={this.handleOnChangeFileComprobante}
                    fileName={this.state.comprobante}
                    entregados={this.state.textoItemsEntregados}
                    max={this.state.maxItemsEntrega}
                />

                <FormListoParaEntrega
                    open={this.state.openListoEntrega}
                    handleClose={this.handleClose}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={items.fetching}
                    onSubmit={this.handleListoParaEntregar}
                    listoEntrega={this.state.textoItemsListoEntrega}
                    max={this.state.maxItemsListoEntrega}
                />
                <FormItemTraslado
                    onSubmit={this.handleItemTraslado}
                    open={this.state.openItemTraslado}
                    handleClose={this.handleClose}
                    confirmacion={this.state.confirmacion}
                    accion={this.state.accion}
                    loading={items.fetching}
                    max={this.state.maxItemsEnTraslado}
                    enTraslado={this.state.textoItemsEnTraslado}
                />*/}
            </Container>
        )
    }
}

const mapStateToProps = state => {
    return {
        tiposRecursos: state.TiposRecursos,
        marcasVehiculos: state.MarcasVehiculos,
        centroLogistico: state.CentroLogistico,
        usuarioAutenticado: state.Usuario,
        usuarios: state.Usuarios.data,
        gerencias: state.Gerencias,
        gerenciasTodas: state.GerenciasGeneral,
        proyectosTodos: state.ProyectosGeneral,
        proyectos: state.Proyectos,
        solicitudes: state.Solicitudes,
        solicitudesUsuario: {
            data: state.Solicitudes.data.filter(x =>
                state.SolicitudesUsuario.data.some(y =>
                    x.id === y.id)),
            fetched: state.SolicitudesUsuario.fetched,
            fetching: state.SolicitudesUsuario.fetching
        },
        solicitudesAprobar: {
            data: state.Solicitudes.data.filter(x => state.SolicitudesAprobar.data.some(y => x.id === y.id)),
            fetched: state.SolicitudesAprobar.fetched,
            fetching: state.SolicitudesAprobar.fetching
        },
        aprobador1: state.Aprobador1.data.esAprobador ? true : false,
        aprobador2: state.Aprobador2.data.esAprobador ? true : false,
        solicitudActual: state.Solicitudes.data.filter(x => x.id === state.Idsolicitud.data),
        idSolicitud: state.Idsolicitud.data,
        idItem: state.Iditem.data,
        estados: state.Estados,
        clases: state.Clases,
        subClases: state.Subclases,
        items: state.Items,
        itemsCotizados: state.ItemsCotizacion.data.filter(y => y.ubicacion_logistica === (state.form.cotizacion ? (state.form.cotizacion.values ? (state.form.cotizacion.values.ubicacion_logistica_id ? state.form.cotizacion.values.ubicacion_logistica_id : "") : "") : "")).map(x => ({
            ...x,
            precio:
                state.form.cotizacion ?
                    (state.form.cotizacion.values ?
                        (state.form.cotizacion.values[x.id] ?
                            state.form.cotizacion.values[x.id] : null) : null) : null,
        })),
        mensaje: state.Mensajes,
        form: state.form,
        modoEdicion: state.ModoEdicion.data,
        gruposCotizacionGeneral: state.GruposCotizacion,
        gruposCotizacion: state.GruposCotizacion.data.filter(x => x.solicitud_recurso_id === state.Idsolicitud.data),
        cotizacionesFetch: state.Cotizaciones,
        cotizaciones: state.Cotizaciones.data.filter(x => x.solicitud_recurso_id === state.Idsolicitud.data),
        cotizacionSelected: state.Cotizaciones.data.filter(x => x.selected === true),
        empresas: state.Empresas,
        centros: state.Centros,
        proveedores: state.Proveedores,
        idGrupoCotizacion: state.IdGrupoCotizacion.data,
        formCotizacion: state.form.cotizacion,
        formRecibir: state.form.recibir,
        itemsCotizacion: state.ItemsCotizacion,
        revisarStock: state.PermisosUsuario.data.some(x => x.nombre === "revisarStock"),
        revisarCotizacion: state.PermisosUsuario.data.some(x => x.nombre === "crearCotizacion"),
        archivo: state.Archivo,
        itemsCotizacionActual: state.ItemsCotizados,
        rangosPrecios: state.RangosPrecios,
        comprobanteRecepcion: state.ComprobanteRecepcion,
        aprobadoresCotizacion: state.AprobadoresCotizacion.data.filter(y => y.proyecto_id === (state.Solicitudes.data.filter(x => x.id === state.Idsolicitud.data)[0] ? state.Solicitudes.data.filter(x => x.id === state.Idsolicitud.data)[0].proyecto : ""))
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({
    ...solicitudesUsuarioDuck,
    ...solicitudesAprobarDuck,
    ...solicitudesDuck,
    ...idsolicitudDuck,
    ...iditemDuck,
    ...itemsDuck,
    ...aprobador1Duck,
    ...aprobador2Duck,
    ...vehiculoDuck,
    ...mensajesDuck,
    ...modoEdicionDuck,
    ...gruposCotizacionDuck,
    ...cotizacionesDuck,
    ...idGrupoCotizacionDuck,
    ...itemsCotizacionDuck,
    ...archivoDuck,
    ...itemsCotizadosDuck,
    ...proyectosGeneralDuck,
    ...gerenciasGeneralDuck,
    ...comprobanteRecepcionDuck,
    ...entregaItemRecurso,
    ...trasladoItemRecursoDuck
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Solicitudes)
