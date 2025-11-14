import React, { useState, useEffect, useContext } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

// ICONS
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import TimerIcon from '@material-ui/icons/Timer';
import StarIcon from '@material-ui/icons/Star';

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import RatingsChart from "../../components/Dashboard/RatingsChart";
import RatingsByUser from "../../components/Dashboard/RatingsByUser";
import ContactsRanking from "../../components/Dashboard/ContactsRanking";

import { isEmpty } from "lodash";
import moment from "moment";
import { i18n } from "../../translate/i18n";
import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js";
import clsx from "clsx";
import { loadJSON } from "../../helpers/loadJSON";

import { SmallPie } from "./SmallPie";
import { TicketCountersChart } from "./TicketCountersChart";
import { getTimezoneOffset } from "../../helpers/getTimezoneOffset.js";

import RcChatRegistry from "../../components/RcChatRegistry";
import { copyToClipboard } from "../../helpers/copyToClipboard.js";
import api from "../../services/api.js";
import { SocketContext } from "../../context/Socket/SocketContext.js";
import { formatTimeInterval } from "../../helpers/formatTimeInterval.js";

const gitinfo = loadJSON('/gitinfo.json');

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  licensingPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    overflowY: "clip",
    height: 300,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    ...theme.scrollbarStyles,
  },
  licensingBox: {
    backgroundColor: theme.palette.secondary.light,
    borderRadius: "10px",
    textAlign: "center",
    borderColor: theme.palette.secondary.main,
    borderWidth: "3px",
    borderStyle: "solid",
    transition: "max-height 0.5s ease",
    overflow: "clip"
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  cardSolid: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "row",
    height: "100%",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  cardGray: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "row",
    height: "100%",
    color: theme.palette.primary.main,
  },
  cardData: {
    display: "block",
    width: "100%",
    zIndex: 1,
  },
  cardIcon: {
    width: 100,
    color: theme.palette.primary.light,
    position: "sticky",
    opacity: 0.4,
    right: 0,
  },
  cardRingGraph: {
    width: 100,
    position: "sticky",
    right: 0,
  },
  rcChatProPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    minHeight: 300,
    backgroundColor: theme.palette.rcproad.main,
    color: theme.palette.rcproad.contrastText,
    ...theme.scrollbarStyles,
  },
  rcChatRegistryPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    backgroundColor: theme.palette.background.main,
    color: theme.palette.background.contrastText,
    borderColor: theme.palette.primary.main,
    borderWidth: "3px",
    borderStyle: "solid",
    marginBottom: "1em",
    ...theme.scrollbarStyles,
  },
  rcChatProBox: {
    textAlign: "center",
    alignContent: "center"
  },
  rcChatProTitle: {
    fontWeight: "bold"
  },
  rcChatProScreen: {
    maxHeight: "300px",
    maxWidth: "100%"
  },
  rcChatProFeatures: {
    padding: 0,
    listStyleType: "none"
  },
  rcChatProCommand: {
    fontFamily: "monospace",
    backgroundColor: "#00000080"
  },
  clickpointer: {
    cursor: "pointer"
  }
}));

const InfoCard = ({ title, value, icon }) => {
  const classes = useStyles();
  
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        className={classes.cardGray}
        elevation={6}
      >
        <div className={classes.cardData}>
          <Typography
            component="h3"
            variant="h6"
            paragraph
          >
            {title}
          </Typography>
          <Typography
            component="h1"
            variant="h4"
          >
            {value}
          </Typography>
        </div>
        <div className={classes.cardIcon}>
          {icon}
        </div>
      </Paper>
    </Grid>
  )
}

const InfoRingCard = ({ title, value, graph }) => {
  const classes = useStyles();
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        className={classes.cardSolid}
        elevation={4}
      >
        <div className={classes.cardData}>
          <Typography
            component="h3"
            variant="h6"
            paragraph
          >
            {title}
          </Typography>
          <Typography
            component="h1"
            variant="h4"
          >
            {value}
          </Typography>
        </div>
        <div className={classes.cardRingGraph}>
          <div style={{ width: "100px", height: "100px" }}>
            {graph}
          </div>
        </div>
      </Paper>
    </Grid>
  )
};

const Dashboard = () => {
  const classes = useStyles();
  const [period, setPeriod] = useState(0);
  const [currentUser, setCurrentUser] = useState({});
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DDTHH") + ":00"
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DDTHH") + ":59");
  const { getCurrentUserInfo } = useAuth();
    
  const [license, setLicense] = useState({});
  const [licenseKey, setLicenseKey] = useState("");
  const [registered, setRegistered] = useState(false);
  const [proInstructionsOpen, setProInstructionsOpen] = useState(false);
  
  const [usersOnlineTotal, setUsersOnlineTotal] = useState(0);
  const [usersOfflineTotal, setUsersOfflineTotal] = useState(0);
  const [usersStatusChartData, setUsersStatusChartData] = useState([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingChartData, setPendingChartData] = useState([]);
  const [openedTotal, setOpenedTotal] = useState(0);
  const [openedChartData, setOpenedChartData] = useState([]);
  
  const [ticketsData, setTicketsData] = useState({});
  const [ratingsData, setRatingsData] = useState({
    avgRate: 0,
    ratingsByStars: {},
    avgRatingsByUser: [],
    ratingsByDay: [],
  });
  const [contactsData, setContactsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const socketManager = useContext(SocketContext);
    
  async function showProInstructions() {
    if (gitinfo.commitHash) {
      setProInstructionsOpen(true);
      return;
    }
    
    window.open("https://painel.rodadecuia.com.br/store/licencas-de-softwares/rc-chat-pro", "_blank");
  }
  
  useEffect(() => {
    api.get("/license").then(res => {
      setLicense(res.data);
    });
  }, []);
  
  useEffect(() => {
    const socket = socketManager.GetSocket(companyId);
    
    socket.on("userOnlineChange", updateStatus);
    socket.on("counter", updateStatus);

    return () => {
      socket.disconnect();
    }
  }, [socketManager]);
  
  useEffect(() => {
    getCurrentUserInfo().then(
      (user) => {
        if (user?.profile !== "admin") {
          window.location.href = "/tickets";
        }
        setCurrentUser(user);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(async () => {
    const registry = await api.get("/rc-chat/registry");

    setRegistered( registry?.data?.disabled || !!(registry?.data?.whatsapp ) );
  }, []);
    
  useEffect(() => {
    fetchData();
  }, [period]);
  
  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleSaveLicense() {
    try {
      await api.post("/license", { licenseKey });
      toast.success("Licença salva com sucesso!");
      const res = await api.get("/license");
      setLicense(res.data);
    } catch (err) {
      toast.error("Erro ao salvar a licença.");
    }
  }

  async function updateStatus() {
    api.get("/dashboard/status").then(
      result => {
        const { data } = result;

        if (!data) return;

        let usersOnlineTotal = 0;
        let usersOfflineTotal = 0;
        data.usersStatusSummary.forEach((item) => {
          if (item.online) {
            usersOnlineTotal++;
          } else {
            usersOfflineTotal++;
          }
        });

        setUsersStatusChartData([
          {
            name: "Online",
            value: usersOnlineTotal,
            color: "#00ff00"
          },
          {
            name: "Offline",
            value: usersOfflineTotal,
            color: "#ff0000"
          }
        ]);

        setUsersOnlineTotal(usersOnlineTotal);
        setUsersOfflineTotal(usersOfflineTotal);

        let pendingTotal = 0;
        let openedTotal = 0;
        const pendingChartData = [];
        const openedChartData = [];
        data.ticketsStatusSummary.forEach((item) => {
          if (item.status === "pending") {
            pendingTotal += Number(item.count);
            pendingChartData.push({
              name: item.queue?.name || i18n.t("common.noqueue"),
              value: Number(item.count),
              color: item.queue?.color || "#888"
            });
            return;
          }
          if (item.status === "open") {
            openedTotal += Number(item.count);
            openedChartData.push({
              name: item.queue?.name || i18n.t("common.noqueue"),
              value: Number(item.count),
              color: item.queue?.color || "#888"
            });
          }
        });
        setPendingTotal(pendingTotal);
        setPendingChartData(pendingChartData);
        setOpenedTotal(openedTotal);
        setOpenedChartData(openedChartData);
      }
    ).catch(() => {});
  }
  
  async function fetchData() {
    let params = { tz: getTimezoneOffset() };
    
    const days = Number(period);

    if (days) {
      params = {
        date_from: moment().subtract(days, "days").format("YYYY-MM-DD"),
        date_to: moment().format("YYYY-MM-DD")
      };
    }

    if (!days && !isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
        hour_from: moment(dateFrom).format("HH:mm:ss")
      };
    }

    if (!days && !isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
        hour_to: moment(dateTo).format("HH:mm:ss")
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error(i18n.t("dashboard.filter.invalid"));
      return;
    }

    api.get("/dashboard/tickets", { params }).then(
      result => {
        if (result?.data) {
          setTicketsData(result.data);
        }
      }).catch(() => {});

    api.get("/dashboard/ratings", { params }).then(
      result => {
        if (result?.data) {
          setRatingsData(result.data);
        }
      }).catch(() => {});

    api.get("/dashboard/contacts", { params }).then(
      result => {
        if (result?.data) {
          setContactsData(result.data);
        }
      }).catch(() => {});

    setLoadingUsers(true);
    api.get("/dashboard/users", { params }).then(
      result => {
        if (result?.data) {
          setUsersData(result.data);
          setLoadingUsers(false);
        }
      }).catch(() => {});
  }

  useEffect(() => {
    updateStatus();
  }, [])

  const companyId = localStorage.getItem("companyId");

  function renderFilters() {
      return (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">{i18n.t("dashboard.filter.period")}</InputLabel>
              <Select
                labelId="period-selector-label"
                id="period-selector"
                value={period}
                onChange={(e) => handleChangePeriod(e.target.value)}
              >
                <MenuItem value={0}>{i18n.t("dashboard.filter.custom")}</MenuItem>
                <MenuItem value={3}>{i18n.t("dashboard.filter.last3days")}</MenuItem>
                <MenuItem value={7}>{i18n.t("dashboard.filter.last7days")}</MenuItem>
                <MenuItem value={15}>{i18n.t("dashboard.filter.last14days")}</MenuItem>
                <MenuItem value={30}>{i18n.t("dashboard.filter.last30days")}</MenuItem>
                <MenuItem value={90}>{i18n.t("dashboard.filter.last90days")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {!period &&
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={i18n.t("dashboard.date.start")}
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onBlur={fetchData}
                  className={classes.fullWidth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label={i18n.t("dashboard.date.end")}
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onBlur={fetchData}
                  className={classes.fullWidth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </>
          }
          <Grid item xs={12} sm={6} md={period ? 9 : 3} />
        </>
      );
  }

  if (currentUser?.profile !== "admin") {
    return (
      <div>
      </div>
    );
  }
      
  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-start">

          { !localStorage.getItem("hideAds") && <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <>
              <Grid item xs={12}>
                {!registered &&
                  <Paper className={classes.rcChatRegistryPaper}>
                    <RcChatRegistry onRegister={setRegistered} />
                  </Paper>
                }
              </Grid>
              <Grid item lg={8} sm={12}>
                <Paper className={clsx(classes.rcChatProPaper, {
                  [classes.clickpointer]: !proInstructionsOpen,
                })} onClick={() => showProInstructions()}>
                  <Grid container justifyContent="flex-end">
                    <Grid className={classes.rcChatProBox} item xs={12} md={proInstructionsOpen ? 4 : 6} sm={12}>
                      <div>
                        <img className={classes.rcChatProScreen} src="https://painel.rodadecuia.com.br/images/0/7/3/0/b/0730b234af7b4b0dac72d09828863bb7cb9193ea-rc-chat-computador.png" />
                      </div>
                    </Grid>
                    { !proInstructionsOpen &&
                    <Grid className={classes.rcChatProBox} item xs={12} md={6} sm={12}>
                      <Typography className={classes.rcChatProTitle} component="h3" variant="h5" gutterBottom>
                        RC Chat Pro
                      </Typography>
                      <Typography component="h4" variant="h7" gutterBottom>
                      <ul className={classes.rcChatProFeatures}>
                        <li>Multi Conexões e funções exclusivas</li>
                        <li>Suporte prioritário</li>
                        <li>Sem limitações de funções e recursos</li>
                      </ul>
                      </Typography>
                      <Typography component="h3" variant="h5">
                        Assine por R$ 99,90/mês
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.open("https://painel.rodadecuia.com.br/store/licencas-de-softwares/rc-chat-pro", "_blank")}
                      >
                        Realize o Upgrade
                      </Button>
                    </Grid>
                    }
                    { proInstructionsOpen &&
                    <Grid className={classes.rcChatProBox} item xs={12} md={8} sm={12}>
                      <Typography className={classes.rcChatProTitle} component="h3" variant="h5" gutterBottom>
                        Instruções de Upgrade
                      </Typography>
                      <Typography paragraph>
                        Se você instalou as imagens disponibilizadas pelo projeto em um servidor ou VPS utilizando as instruções facilitadas, tudo o que você precisa fazer é acessar sua área do cliente no link abaixo:
                      </Typography>
                      <Typography paragraph>
                        <a href="https://painel.rodadecuia.com.br/clientarea.php?action=services" target="_blank" rel="noopener noreferrer">
                          https://painel.rodadecuia.com.br/clientarea.php?action=services
                        </a>
                      </Typography>
                      <Typography paragraph>
                        Pegue a chave de licença conforme o serviço contratado, adicione no campo indicado e pronto, o RC Chat PRO estará ativado.
                      </Typography>
                      <Typography paragraph>
                        Se a tua instalação for diferente ou acredita que precisa de auxílio para instalar o RC Chat Pro, entre em contato que nós ajudamos!
                      </Typography>
                    </Grid>
                    }
                  </Grid>
                </Paper>
              </Grid>
              </>
            )} />
          }

          { !localStorage.getItem("hideAds") && <OnlyForSuperUser
            user={currentUser}
            yes={() => (
              <Grid item lg={4} sm={12}>
                <Paper className={classes.licensingPaper}>
                  <Typography style={{ overflow: "hidden" }} component="h2" variant="h6" gutterBottom>
                    Informações de licenciamento
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography>Status: {license.status}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>Validade: {license.expiry}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>Tipo: {license.type}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>Próxima renovação: {license.nextRenewal}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Chave de licença"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveLicense}
                        fullWidth
                      >
                        Salvar
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )} /> }

          {/* USUARIOS ONLINE */}
          <InfoRingCard
            title={i18n.t("dashboard.usersOnline")}
            value={`${usersOnlineTotal}/${usersOnlineTotal + usersOfflineTotal}`}
            graph={
              <SmallPie chartData={usersStatusChartData} />
            }
          />

          {/* ATENDIMENTOS PENDENTES */}
          <InfoRingCard
            title={i18n.t("dashboard.ticketsWaiting")}
            value={pendingTotal}
            graph={
              <SmallPie chartData={pendingChartData} />
            }
          />

          {/* ATENDIMENTOS ACONTECENDO */}
          <InfoRingCard
            title={i18n.t("dashboard.ticketsOpen")}
            value={openedTotal}
            graph={
              <SmallPie chartData={openedChartData} />
            }
          />

          {/* FILTROS */}
          {renderFilters()}

          {/* ATENDIMENTOS REALIZADOS */}
          <InfoCard
            title={i18n.t("dashboard.ticketsDone")}
            value={ticketsData.ticketStatistics?.totalClosed || 0}
            icon={<CheckCircleIcon style={{ fontSize: 100 }} />}
          />

          {/* NOVOS CONTATOS */}
          <InfoCard
            title={i18n.t("dashboard.newContacts")}
            value={ticketsData.ticketStatistics?.newContacts || 0}
            icon={<GroupAddIcon style={{ fontSize: 100 }} />}
          />

          {/* T.M. DE ATENDIMENTO */}
          <InfoCard
            title={i18n.t("dashboard.avgServiceTime")}
            value={formatTimeInterval(ticketsData.ticketStatistics?.avgServiceTime)}
            icon={<TimerIcon style={{ fontSize: 100 }} />}
          />

          {/* T.M. DE ESPERA */}
          <InfoCard
            title={i18n.t("dashboard.avgWaitTime")}
            value={formatTimeInterval(ticketsData.ticketStatistics?.avgWaitTime)}
            icon={<HourglassEmptyIcon style={{ fontSize: 100 }} />}
          />

          {/* NOTA MÉDIA DE SATISFAÇÃO */}
          <InfoCard
            title={i18n.t("dashboard.avgRating")}
            value={ratingsData.avgRate.toFixed(2)}
            icon={<StarIcon style={{ fontSize: 100 }} />}
          />

          {/* DASHBOARD ATENDIMENTOS NO PERÍODO */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <TicketCountersChart
                ticketCounters={ticketsData.ticketCounters}
                start={ticketsData.start}
                end={ticketsData.end}
                hour_start={ticketsData.hour_start}
                hour_end={ticketsData.hour_end}
               />
            </Paper>
          </Grid>

          {/* GRÁFICO DE AVALIAÇÕES */}
          <Grid item xs={12} md={6}>
            <Paper className={classes.fixedHeightPaper}>
              <RatingsChart data={ratingsData.ratingsByStars} />
            </Paper>
          </Grid>

          {/* TABELA DE AVALIAÇÕES POR ATENDENTE */}
          <Grid item xs={12} md={6}>
            <Paper className={classes.fixedHeightPaper}>
              <RatingsByUser data={ratingsData.avgRatingsByUser} />
            </Paper>
          </Grid>

          {/* RANKING DE CONTATOS */}
          <Grid item xs={12}>
            <Paper className={classes.fixedHeightPaper}>
              <ContactsRanking data={contactsData} />
            </Paper>
          </Grid>

          {/* USER REPORT */}
          <Grid item xs={12}>
            {usersData.userReport?.length ? (
              <TableAttendantsStatus
                attendants={usersData.userReport}
                loading={loadingUsers}
              />
            ) : null}
          </Grid>

        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
