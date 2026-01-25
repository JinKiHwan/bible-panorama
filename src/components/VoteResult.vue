<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { gsap } from 'gsap';

const chefStats = ref([
  { id: 'chef1', name: '트리플 스타', team: 'black', votes: 0 },
  { id: 'chef2', name: '철가방 요리사', team: 'black', votes: 0 },
  { id: 'chef3', name: '최강록', team: 'white', votes: 0 },
  { id: 'chef4', name: '에드워드 리', team: 'white', votes: 0 },
]);

onMounted(() => {
  // 1. Firestore에서 실시간 데이터 구독
  onSnapshot(collection(db, 'votes'), (snapshot) => {
    const totalVotes = snapshot.size;
    const counts = {};

    snapshot.forEach((doc) => {
      const selections = doc.data().selections || [];
      selections.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    });

    // 2. 데이터 업데이트 및 애니메이션 실행
    chefStats.value.forEach((chef) => {
      chef.votes = counts[chef.id] || 0;
      const percentage = totalVotes > 0 ? (chef.votes / totalVotes) * 100 : 0;

      // GSAP로 부드럽게 막대기 늘리기
      gsap.to(`.bar-${chef.id}`, {
        width: `${percentage}%`,
        duration: 1.2,
        ease: 'power2.out',
      });
    });
  });
});
</script>

<template>
  <div class="result-dashboard">
    <h2 class="result-title">REAL-TIME VOTING STATUS</h2>

    <div class="stats-container">
      <div v-for="chef in chefStats" :key="chef.id" class="stat-row">
        <div class="chef-label">
          <span :class="['team-dot', chef.team]"></span>
          <span class="name">{{ chef.name }}</span>
          <span class="count">{{ chef.votes }}표</span>
        </div>
        <div class="progress-track">
          <div :class="['progress-bar', chef.team, `bar-${chef.id}`]" style="width: 0%"></div>
        </div>
      </div>
    </div>

    <div class="result-footer">
      <p>실시간으로 집계된 데이터입니다.</p>
      <button @click="$router.push('/')" class="btn-home">메인으로 돌아가기</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.result-dashboard {
  background: rgba(0, 0, 0, 0.8);
  padding: 40px;
  border: 1px solid #333;
  color: #fff;

  .stat-row {
    margin-bottom: 25px;
    text-align: left;
  }

  .chef-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-weight: bold;

    .team-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      &.black {
        background: #fff;
      }
      &.white {
        background: #888;
      }
    }
    .count {
      margin-left: auto;
      color: #aaa;
    }
  }

  .progress-track {
    height: 8px;
    background: #222;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    &.black {
      background: linear-gradient(90deg, #444, #fff);
    }
    &.white {
      background: linear-gradient(90deg, #333, #888);
    }
  }
}
</style>
