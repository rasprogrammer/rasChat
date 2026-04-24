import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // ======================
  // USERS
  // ======================
  const rajeev = await prisma.user.create({
    data: {
      name: "Rajeev Kumar",
      email: "rajeev@gmail.com",
      password: "hashed_password",
      isOnline: true,
    }
  });

  const aman = await prisma.user.create({
    data: {
      name: "Aman Singh",
      email: "aman@gmail.com",
      password: "hashed_password",
    }
  });

  const neha = await prisma.user.create({
    data: {
      name: "Neha Sharma",
      email: "neha@gmail.com",
      password: "hashed_password",
    }
  });

  const pooja = await prisma.user.create({
    data: {
      name: "Pooja Verma",
      email: "pooja@gmail.com",
      password: "hashed_password",
    }
  });

  // ======================
  // CONVERSATIONS
  // ======================
  const conv1 = await prisma.conversation.create({
    data: {
      type: "PRIVATE",
      participants: {
        create: [
          { userId: rajeev.id },
          { userId: aman.id },
        ]
      }
    }
  });

  const conv2 = await prisma.conversation.create({
    data: {
      type: "PRIVATE",
      participants: {
        create: [
          { userId: rajeev.id },
          { userId: neha.id },
        ]
      }
    }
  });

  // ======================
  // MESSAGES
  // ======================
  const msg1 = await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: rajeev.id,
      type: "TEXT",
      text: "Hi Aman 👋",
    }
  });

  const msg2 = await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: aman.id,
      type: "TEXT",
      text: "Hello Rajeev 😊",
    }
  });

  const msg3 = await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: rajeev.id,
      type: "IMAGE",
      fileUrl: "https://example.com/image.png",
    }
  });

  // ======================
  // MESSAGE STATUS
  // ======================
  await prisma.messageStatus.createMany({
    data: [
      {
        messageId: msg1.id,
        userId: aman.id,
        status: "SEEN",
      },
      {
        messageId: msg2.id,
        userId: rajeev.id,
        status: "DELIVERED",
      }
    ]
  });

  // ======================
  // USER BLOCK
  // ======================
  await prisma.userBlock.create({
    data: {
      blockerId: rajeev.id,
      blockedId: pooja.id,
    }
  });

  console.log("✅ Dummy data inserted successfully");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
