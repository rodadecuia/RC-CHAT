import React, { useState, useEffect } from "react";

import { Avatar, CardHeader, Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";
import { getInitials } from "../../helpers/getInitials";
import { generateColor } from "../../helpers/colorGenerator";

const useStyles = makeStyles(theme => ({
	ticketId: {
		fontSize: "0.8rem",
		color: theme.palette.text.secondary,
		marginLeft: theme.spacing(1),
	},
	whmcsTicketId: {
		fontSize: "0.8rem",
		color: theme.palette.text.secondary,
		marginLeft: theme.spacing(1),
		textDecoration: "underline",
		cursor: "pointer",
	},
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	const { user } = ticket
	const [userName, setUserName] = useState('')
	const [contactName, setContactName] = useState('')

	useEffect(() => {
		if (contact) {
			setContactName(contact.name);
			if(document.body.offsetWidth < 600) {
				if (contact.name.length > 10) {
					const truncadName = contact.name.substring(0, 10) + '...';
					setContactName(truncadName);
				}
			}
		}

		if (user && contact) {
			setUserName(`${i18n.t("messagesList.header.assignedTo")} ${user.name}`);

			if(document.body.offsetWidth < 600) {
				setUserName(`${user.name}`);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const whmcsPanelUrl = process.env.REACT_APP_WHMCS_PANEL_URL;

	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar style={{ backgroundColor: generateColor(contact?.number), color: "white", fontWeight: "bold" }} src={contact.profilePicUrl} alt="contact_image">{ getInitials(contact?.name) }</Avatar>}
			title={
				<>
					{contactName}
					<Typography component="span" className={classes.ticketId}>
						#{ticket.id}
					</Typography>
					{ticket.whmcsTicketId && whmcsPanelUrl && (
						<Link
							href={`${whmcsPanelUrl}${ticket.whmcsTicketId}`}
							target="_blank"
							rel="noopener"
							className={classes.whmcsTicketId}
							onClick={(e) => e.stopPropagation()} // Evita que o clique no link abra o drawer
						>
							WHMCS: #{ticket.whmcsTicketId}
						</Link>
					)}
				</>
			}
			subheader={ticket.user && `${userName}`}
		/>
	);
};

export default TicketInfo;
