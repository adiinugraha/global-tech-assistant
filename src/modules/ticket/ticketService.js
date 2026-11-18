/**
 * Ticket & Support System Service
 * Manages private ticket channel creation, category routing, claims, transcripts, and closure.
 */

const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const db = require('../../database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { TICKET_CATEGORIES, COLORS, DEFAULTS } = require('../../config/constants');
const { isModerator } = require('../../utils/permissions');

const ticketService = {
  /**
   * Build the master ticket panel embed and category select menu
   */
  createPanelPayload() {
    const embed = embeds.base(
      '🎫 Pusat Layanan & Bantuan Komunitas',
      'Silakan pilih kategori tiket di menu bawah untuk membuka ruang percakapan privat dengan tim staf dan support Network Intelligence.\n\n' +
      '• **General Support:** Bantuan umum server\n' +
      '• **Technical Support:** Kendala teknis, jaringan, atau kode\n' +
      '• **Report:** Laporan insiden atau pelanggaran\n' +
      '• **Partnership:** Kolaborasi atau kemitraan komunitas\n' +
      '• **Other:** Hal lain yang memerlukan privasi',
      COLORS.PRIMARY
    );

    const select = new StringSelectMenuBuilder()
      .setCustomId('select_ticket_category')
      .setPlaceholder('Pilih kategori tiket bantuan...')
      .addOptions(
        TICKET_CATEGORIES.map(cat => ({
          label: cat.label,
          value: cat.value,
          description: cat.description,
          emoji: cat.emoji
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);
    return { embeds: [embed], components: [row] };
  },

  /**
   * Create a new ticket channel when user selects a category
   */
  async createTicket(interaction, categoryValue) {
    const guild = interaction.guild;
    const user = interaction.user;
    const settings = db.getGuildSettings(guild.id);

    // Check active ticket limit for user
    const openTickets = db.all(
      "SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status != 'closed'",
      guild.id,
      user.id
    );

    if (openTickets.length >= DEFAULTS.TICKET_LIMIT_PER_USER) {
      return interaction.reply({
        content: `⚠️ Anda sudah memiliki ${openTickets.length} tiket yang masih aktif. Harap selesaikan tiket Anda sebelumnya terlebih dahulu.`,
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const categoryObj = TICKET_CATEGORIES.find(c => c.value === categoryValue) || TICKET_CATEGORIES[0];
    const cleanUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const channelName = `ticket-${categoryObj.value}-${cleanUsername}`;

    // Permissions: @everyone denied, creator allowed, bot allowed, support role allowed
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks
        ]
      },
      {
        id: guild.members.me.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ];

    if (settings.mod_role_id) {
      permissionOverwrites.push({
        id: settings.mod_role_id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles
        ]
      });
    }

    try {
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: settings.ticket_category_id || null,
        permissionOverwrites,
        topic: `Tiket Bantuan [${categoryObj.label}] untuk ${user.tag} (${user.id})`
      });

      // Save ticket in database
      const result = db.run(
        `INSERT INTO tickets (guild_id, channel_id, user_id, category, status)
         VALUES (?, ?, ?, ?, 'open')`,
        guild.id,
        channel.id,
        user.id,
        categoryObj.value
      );

      const ticketId = result.lastInsertRowid;

      // Send initial ticket message in the newly created channel
      const ticketEmbed = embeds.base(
        `🎫 Tiket #${ticketId} - ${categoryObj.label}`,
        `Halo <@${user.id}>! Terima kasih telah menghubungi pusat bantuan.\n` +
        `Jelaskan pertanyaan atau kendala Anda secara lengkap. Tim staf kami akan segera merespons.\n\n` +
        `**Kategori:** ${categoryObj.emoji} ${categoryObj.label}`,
        COLORS.PRIMARY
      );

      const actionButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_claim_${channel.id}`)
          .setLabel('Claim Tiket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🙋‍♂️'),
        new ButtonBuilder()
          .setCustomId(`ticket_close_${channel.id}`)
          .setLabel('Tutup Tiket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await channel.send({
        content: `<@${user.id}> | ${settings.mod_role_id ? `<@&${settings.mod_role_id}>` : ''}`,
        embeds: [ticketEmbed],
        components: [actionButtons]
      });

      return interaction.editReply({
        content: `✅ Tiket Anda berhasil dibuat: <#${channel.id}>`
      });
    } catch (err) {
      logger.error('Failed to create ticket channel:', err);
      return interaction.editReply({
        content: `❌ Gagal membuat ruang tiket: ${err.message}`
      });
    }
  },

  /**
   * Handle ticket claim
   */
  async handleClaim(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: 'Hanya tim staf yang dapat meng-claim tiket ini.', ephemeral: true });
    }

    const ticket = db.get('SELECT * FROM tickets WHERE channel_id = ?', interaction.channelId);
    if (!ticket) {
      return interaction.reply({ content: 'Data tiket tidak ditemukan.', ephemeral: true });
    }

    if (ticket.claimed_by) {
      return interaction.reply({ content: `Tiket ini sudah di-claim oleh <@${ticket.claimed_by}>.`, ephemeral: true });
    }

    db.run("UPDATE tickets SET claimed_by = ?, status = 'claimed' WHERE id = ?", interaction.user.id, ticket.id);

    return interaction.reply({
      embeds: [embeds.info('Tiket Di-claim', `Tiket ini telah di-claim oleh staf <@${interaction.user.id}> dan sedang dalam penanganan.`)]
    });
  },

  /**
   * Handle ticket close and generate transcript
   */
  async handleClose(interaction) {
    const ticket = db.get('SELECT * FROM tickets WHERE channel_id = ?', interaction.channelId);
    if (!ticket) {
      return interaction.reply({ content: 'Data tiket tidak ditemukan.', ephemeral: true });
    }

    await interaction.reply({
      embeds: [embeds.warning('Menutup Tiket', 'Tiket sedang diproses untuk ditutup dan diarsipkan...')]
    });

    try {
      // Fetch last 100 messages for transcript
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const transcriptLines = messages
        .reverse()
        .map(m => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.cleanContent}`)
        .join('\n');

      db.run(
        "UPDATE tickets SET status = 'closed', transcript = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?",
        transcriptLines,
        ticket.id
      );

      // Offer Delete or Reopen button
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_delete_${interaction.channelId}`)
          .setLabel('Hapus Kanal Tiket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️')
      );

      await interaction.channel.send({
        embeds: [embeds.info('Tiket Ditutup', 'Tiket ini telah resmi ditutup. Transkrip telah disimpan dengan aman.')],
        components: [row]
      });
    } catch (err) {
      logger.error('Error closing ticket:', err);
    }
  },

  /**
   * Handle ticket channel deletion
   */
  async handleDelete(interaction) {
    if (!isModerator(interaction.member)) {
      return interaction.reply({ content: 'Hanya tim staf yang berwenang menghapus kanal tiket.', ephemeral: true });
    }

    await interaction.reply('Kanal tiket akan dihapus dalam 5 detik...');
    setTimeout(() => {
      interaction.channel.delete().catch(e => logger.error('Failed to delete ticket channel:', e));
    }, 5000);
  }
};

module.exports = ticketService;
