import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import { Paper, IconButton} from '@material-ui/core';
import Table from './Table'
import BotonMenuCotizaciones from './BotonMenuCotizaciones'
import DetalleSolicitud from '../containers/DetalleSolicitud'
import RevisionStock from '../containers/RevisionStock'
import AdquisicionCotizacion from '../containers/AdquisicionCotizacion'
import EntregaRecepcion from '../containers/EntregaRecepcion'
import moment from 'moment'
import 'moment/locale/es'
moment.locale('es')


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    margin: 'auto',
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  estado:{
    margin: 'auto',
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
}));

const style = {
  etapa1: estado => ({
    color: (estado === 1 || estado === 2 ) ? "blue" : "",
  }),
}

export default function ControlledExpansionPanels(props) {
  const { 
          solicitud,
          items,
          estados,
          /*clases,
          subClases,             
          handleEditarItemsModal,
          gruposCotizacion,
          cotizaciones,
          handleCrearGrupoCotizacionModal,
          handleSolicitarAprobacionModal,
          handleCrearCotizacionModal,
          handleIdGrupoCotizacion,
          idGrupoCotizacion,
          centros,
          proveedores,
          revisarStock,
          revisarCotizacion,
          handleCotizacionModal,
          centroLogistico,
          marcasVehiculos,
          tiposRecursos,
          aprobadoresCotizacion,
          rangosPrecios,
          usuarioAutenticado*/
          } = props

  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container className={classes.root}>
      <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <ExpansionPanelSummary
          style={items.data.some(x => (x.estado === 1 || x.estado === 2)) ? { borderLeft: '10px solid #D3FFB8'} : {}}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography className={classes.heading}>Detalle de la solicitud</Typography>
          <Typography className={classes.secondaryHeading}>Solicitud N°: {solicitud[0] ? solicitud[0].codigo : ""} </Typography>
          <Typography className={classes.estado}>Estado: {estados.data.filter(y => y.id === solicitud[0].estado)[0].nombre}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <DetalleSolicitud/>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel  expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <ExpansionPanelSummary
          style={items.data.some(x => (x.estado === 3 || x.estado === 7)) ? { borderLeft: '10px solid #D3FFB8'} : {}}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography  className={classes.heading}>Revisión de Stock</Typography>
          <Typography className={classes.secondaryHeading}>
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <RevisionStock />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      
      <ExpansionPanel  expanded={expanded === 'panel3'} onChange={handleChange('panel3')} >
        <ExpansionPanelSummary
          style={items.data.some(x => (x.estado === 8 || x.estado === 9 || x.estado === 12)) ? { borderLeft: '10px solid #D3FFB8'} : {}}

          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography className={classes.heading}>Adquisición y Cotización</Typography>
          {false &&<Typography className={classes.secondaryHeading}>
            Estado:
          </Typography>}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <AdquisicionCotizacion />
        {/*<Grid item xs={12}>
          <Container>
              <Typography variant="h5" gutterBottom>
                Solicitud de Recurso  N° {solicitud[0] ? solicitud[0].codigo : ""}
              </Typography>
          </Container>
          <Container>
            {revisarCotizacion && 
            <Container>
              <Grid>
                <Button onClick={handleCrearGrupoCotizacionModal} variant="outlined" color="primary" className={classes.button}>
                  Crear Nuevo Grupo de Cotización
                </Button>
                <Button onClick={handleSolicitarAprobacionModal} variant="outlined" color="primary" className={classes.button}>
                  Solicitar Aprobación de Cotizaciones
                </Button>
              </Grid>
            </Container>}

            <Container >
              {gruposCotizacion.map((x,id) =>
                <Paper style={{ margin: '20px'}} key={x.id}>
                  <a onClick={handleIdGrupoCotizacion(x.id)} style={{ cursor: 'pointer'}}><Typography variant="body1"><IconButton ><i className="material-icons">keyboard_arrow_down</i></IconButton><strong>Mostrar Cotizaciones Grupo {id+1}</strong></Typography></a>
                  { x.id === idGrupoCotizacion &&
                  <Grid>
                    <Grid item xs={12} lg={12}>
                      <Grid container justify="center" alignItems="center"  >
                        <Typography variant="body1">Cotizaciones del Grupo</Typography>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} lg={12}>
                      <Table 
                        search={false}
                        columnas={[
                          { title: 'Código', field: 'codigo', cellStyle: {
                            width: '200px',
                            textAlign:"center",
                            padding: '0px',
                          },headerStyle: {
                              textAlign: "center",
                              padding: '0px',
                          }},
                          { title: 'Fecha Orden', field: 'fecha_orden', cellStyle: {
                            width: '10px',
                            padding: '0px',
                            textAlign:"center"
                          },headerStyle: {
                            textAlign: "center",
                            padding: '0px',
                          }},
                          { title: 'Centro Logístico', field: 'centro_logistico',cellStyle: {
                            width: '200px',
                            padding: '0px',
                            textAlign:"center"
                          },headerStyle: {
                            textAlign: "center",
                            padding: '0px',
                          }},
                          { title: 'Proveedor', field: 'proveedor',cellStyle: {
                            width: '10px',
                            padding: '0px',
                            textAlign:"center"
                          },headerStyle: {
                            padding: '0px',
                            textAlign: "center",
                          }},
                          { title: 'Monto Total', field: 'monto_total', cellStyle: {
                            textAlign:"center",
                            padding: '0px',
                          },headerStyle: {
                            textAlign: "center",
                            padding: '0px',
                          }},
                          { title: 'Estado', field: 'estado', sorting: false, cellStyle: {
                            width: '150px',
                            padding: '0px',
                            textAlign:"center"
                          },headerStyle: {
                            padding: '0px',
                            textAlign: "center",
                          }},
                          { title: 'Acción', field: 'accion', sorting: false, cellStyle: {
                            width: '150px',
                            padding: '0px',
                            textAlign:"center"
                          },headerStyle: {
                            padding: '0px',
                            textAlign: "center",
                          }},
                        ]}
                        data={cotizaciones.filter(w => w.activo).filter(y => y.grupo_cotizacion_id === x.id).map(z => ({
                        codigo: z.codigo,
                        fecha_orden: moment(z.fecha_orden).format('DD-MM-YYYY'),
                        centro_logistico: centros.data.filter( w => w.id === z.ubicacion_logistica_id)[0].nombre,
                        proveedor: proveedores.data.filter( w => w.id === z.proveedor_id)[0].nombre,
                        monto_total:z.monto_total.toLocaleString('es-CL', {style: 'currency', currency: 'CLP'}),
                        estado: z.aprobada ? "Aprobada" : "Pendiente",
                        accion: <BotonMenuCotizaciones aprobador={true} aprobador={aprobadoresCotizacion.filter( a => a.rango_aprobacion_cotizacion_id === rangosPrecios.data.filter( w => ( (z.monto_total > w.monto_min) && (z.monto_total < w.monto_max) ) )[0].id).some(w => w.usuario_id === usuarioAutenticado.data.id)} estado={z.aprobada} id={z.id} handleCotizacionModal={handleCotizacionModal} />
                        }))}
                      />
                    </Grid>
                    {revisarCotizacion && 
                    <Grid style={{ margin: '20px'}} container justify="center" alignItems="center"  >
                      <Button onClick={handleCrearCotizacionModal} variant="outlined" color="primary">
                        Crear Nueva Cotización <i className="material-icons">add</i>
                      </Button>
                    </Grid>}
                  </Grid>}
                </Paper>
              )}
            </Container>
          </Container>
        </Grid>*/}
        </ExpansionPanelDetails>
      </ExpansionPanel>


      <ExpansionPanel expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <ExpansionPanelSummary
          style={items.data.some(x => (x.estado === 6 || x.estado === 17 || x.estado === 18 || x.estado === 19)) ? { borderLeft: '10px solid #D3FFB8'} : {}}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <Typography className={classes.heading}>Entrega y Recepción</Typography>
          {false &&<Typography className={classes.secondaryHeading}>
            Entrega:
          </Typography>}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <EntregaRecepcion />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Container>
  );
}
